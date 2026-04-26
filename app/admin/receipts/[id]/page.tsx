import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const receipt = await prisma.receipt.findUnique({
        where: { id: params.id },
        include: {
            user: true,
            resident: { include: { listing: { include: { house: true } } } },
            booking: { include: { listing: { include: { house: true } } } },
        },
    });

    if (!receipt) {
        return <div className="p-10 text-center">Receipt Not Found</div>;
    }

    const contactEmailSetting = await prisma.setting.findUnique({ where: { key: "contact_email" } });
    const contactEmail = contactEmailSetting?.value || "houseofjessehostel@gmail.com";

    const listingName = receipt.resident?.listing?.title || receipt.booking?.listing?.title || "N/A";
    const houseName = receipt.resident?.listing?.house?.name || receipt.booking?.listing?.house?.name || "HOJ";
    const clientName = receipt.resident?.name || receipt.booking?.residentName || receipt.user?.name || "Client";
    const clientEmail = receipt.resident?.email || receipt.booking?.residentEmail || receipt.user?.email || "N/A";

    return (
        <div className="bg-white min-h-screen text-black flex justify-center py-10 print:py-0 print:bg-white">
            <div className="w-full max-w-[800px] bg-white border border-gray-200 p-10 shadow-lg print:shadow-none print:p-0 print:border-none">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#ff7a1a]">HOJ HOSTEL</h1>
                        <p className="text-gray-500 text-sm mt-1">House of Jesse, Ajah, Lagos</p>
                        <p className="text-gray-500 text-sm">{contactEmail}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black text-gray-200 tracking-wider">RECEIPT</h2>
                        <p className="font-mono text-gray-600 mt-2">{receipt.receiptNumber}</p>
                        <p className="text-gray-500 text-sm mt-1">{new Date(receipt.createdAt).toDateString()}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-10 mb-8 border-b-2 border-gray-100 pb-8">
                    <div>
                        <h3 className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-2">Billed To</h3>
                        <p className="font-bold text-gray-800 text-lg">{clientName}</p>
                        <p className="text-gray-600 text-sm">{clientEmail}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-2">Payment Details</h3>
                        <p className="text-gray-600 text-sm"><span className="font-semibold text-gray-800">Status:</span> PAID ({receipt.type})</p>
                        <p className="text-gray-600 text-sm"><span className="font-semibold text-gray-800">Accommodation:</span> {listingName} @ {houseName}</p>
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-10">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 text-xs uppercase text-gray-400 font-bold tracking-wider">Description</th>
                                <th className="py-3 text-xs uppercase text-gray-400 font-bold tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-50">
                                <td className="py-4 text-gray-800">{receipt.description}</td>
                                <td className="py-4 text-gray-800 text-right font-medium">₦{receipt.amount.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Total */}
                <div className="flex justify-end mb-16">
                    <div className="w-64">
                        <div className="flex justify-between py-2 border-t border-gray-200">
                            <span className="text-gray-500 font-medium">Subtotal</span>
                            <span className="text-gray-800">₦{receipt.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-500 font-medium">Tax</span>
                            <span className="text-gray-800">₦0</span>
                        </div>
                        <div className="flex justify-between py-4">
                            <span className="text-gray-800 font-bold text-lg">Total Paid</span>
                            <span className="text-[#ff7a1a] font-black text-xl">₦{receipt.amount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-400 border-t border-gray-200 pt-8 print:border-none">
                    <p>Thank you for choosing HOJ Hostel.</p>
                    <p>This is a system generated receipt and requires no signature.</p>
                </div>

                {/* Print Button (hidden when printing) */}
                <div className="mt-10 text-center print:hidden">
                    <button id="print-receipt-btn" className="px-8 py-3 bg-[#111] hover:bg-[#333] transition-colors text-white font-bold rounded-full">
                        Print / Save as PDF
                    </button>
                    <script dangerouslySetInnerHTML={{ __html: `document.getElementById('print-receipt-btn').addEventListener('click', function() { window.print(); })` }} />
                </div>

            </div>
        </div>
    );
}
