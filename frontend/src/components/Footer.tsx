import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-parchment-900 text-parchment-200 border-t border-parchment-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span className="font-serif font-bold text-2xl text-parchment-50">NaniBot</span>
            </div>
            <p className="text-xs text-parchment-300 leading-relaxed">
              A digital archive preserving generations of intergenerational household wisdom, traditional remedies, and kitchen hacks — presented responsibly with evidence-aware AI.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-sm text-parchment-100 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-parchment-300">
              <li><Link href="/chat" className="hover:text-turmeric-400 transition-colors">Ask NaniBot</Link></li>
              <li><Link href="/explore" className="hover:text-turmeric-400 transition-colors">Explore All Wisdom</Link></li>
              <li><Link href="/contribute" className="hover:text-turmeric-400 transition-colors">Submit Family Tip</Link></li>
              <li><Link href="/archive" className="hover:text-turmeric-400 transition-colors">Nani's Notebook</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-serif font-semibold text-sm text-parchment-100 uppercase tracking-wider mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-parchment-300">
              <li><Link href="/explore?category=Health+%26+Traditional+Remedies" className="hover:text-turmeric-400 transition-colors">Health & Remedies</Link></li>
              <li><Link href="/explore?category=Kitchen+Wisdom" className="hover:text-turmeric-400 transition-colors">Kitchen Wisdom</Link></li>
              <li><Link href="/explore?category=Cleaning" className="hover:text-turmeric-400 transition-colors">Cleaning & Stain Hacks</Link></li>
              <li><Link href="/explore?category=Beauty+%26+Self-Care" className="hover:text-turmeric-400 transition-colors">Beauty & Self-Care</Link></li>
            </ul>
          </div>

          {/* Important Principles */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-sm text-parchment-100 uppercase tracking-wider">
              Product Principles
            </h4>
            <p className="text-[11px] text-parchment-400 leading-normal border-l-2 border-turmeric-500 pl-3">
              NaniBot is an archivist of cultural heritage. It distinguishes traditional practices from scientific evidence and always advises consulting qualified doctors for medical needs.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-parchment-800 flex flex-col md:flex-row items-center justify-between text-xs text-parchment-400">
          <p>© {new Date().getFullYear()} NaniBot — Preserving Intergenerational Wisdom.</p>
          <p className="mt-2 md:mt-0 font-serif italic text-parchment-300">
            "The wisdom that was never written down." 🌿
          </p>
        </div>
      </div>
    </footer>
  );
}
