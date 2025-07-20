'use client';
import translations from '../lib/translations/customer/footer.json';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-neutral-900 text-white w-full overflow-x-hidden">
            <div className="container px-4 py-8 md:py-12 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 md:justify-between">
                    {/* Company Info */}
                    <div className="space-y-6 md:max-w-sm">
                        <div className="flex items-center space-x-2">
                            <div className="text-2xl">🍕</div>
                            <span className="text-xl font-bold">{translations.companyInfo.name}</span>
                        </div>
                        <p className="text-neutral-300 leading-relaxed">
                            {translations.companyInfo.description}
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6 md:ml-auto">
                        <h3 className="text-lg font-semibold">{translations.contact.title}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">{translations.contact.address.emoji}</span>
                                <p className="text-neutral-300 pt-3">
                                    {translations.contact.address.text}
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">{translations.contact.phone.emoji}</span>
                                <a
                                    href={`tel:${translations.contact.phone.number}`}
                                    className="text-neutral-300 hover:text-white transition-colors"
                                >
                                    {translations.contact.phone.number}
                                </a>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">{translations.contact.email.emoji}</span>
                                <a
                                    href={`mailto:${translations.contact.email.address}`}
                                    className="text-neutral-300 hover:text-white transition-colors"
                                >
                                    {translations.contact.email.address}
                                </a>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">{translations.contact.hours.emoji}</span>
                                <p className="text-neutral-300">
                                    {translations.contact.hours.text}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-neutral-800 mt-8 pt-8">
                    <div className="text-center md:text-left text-neutral-400 text-sm">
                        {translations.copyright.text.replace('{year}', currentYear.toString())}
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-neutral-800 py-4">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                        <div className="text-neutral-400 text-sm">
                            {translations.payment.title}
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-2xl">{translations.payment.methods.card}</span>
                            <span className="text-2xl">{translations.payment.methods.bank}</span>
                            <span className="text-2xl">{translations.payment.methods.mobile}</span>
                            <span className="text-neutral-400 text-sm whitespace-nowrap">
                                {translations.payment.security}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
} 