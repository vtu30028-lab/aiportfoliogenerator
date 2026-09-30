export default function Home() {
    return (
        <div className="container mx-auto px-8 py-20 text-center flex flex-col items-center justify-center min-h-[80vh]">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-black">
                CRAFT YOUR LEGACY.
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl font-light">
                Generate a stunning, professional portfolio from your resume using advanced AI. No fluff, just results.
            </p>
            <button className="bg-black text-white px-10 py-4 rounded-none text-lg font-semibold hover:bg-gray-800 transition-colors uppercase tracking-wide">
                Get Started
            </button>
        </div>
    );
}
