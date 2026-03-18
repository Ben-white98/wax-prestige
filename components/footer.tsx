import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-neutral-100 dark:bg-neutral-900 py-12 border-t border-neutral-200 dark:border-neutral-800 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-2xl font-bold text-amber-600 mb-4">
            Wax Prestige
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Votre boutique de référence pour les pagnes africains de haute
            qualité. Élégance, authenticité et prestige.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-lg">Liens rapides</h4>
          <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
            <li>
              <Link
                href="/catalogue"
                className="hover:text-amber-600 transition-colors"
              >
                Catalogue
              </Link>
            </li>
            <li>
              <Link
                href="/catalogue?sort=newest"
                className="hover:text-amber-600 transition-colors"
              >
                Nouveautés
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-amber-600 transition-colors"
              >
                Contact
              </Link>
            </li>
            {/* <li><Link href="/admin/login" className="hover:text-amber-600 transition-colors">Espace Administrateur</Link></li> */}
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-lg">Contact</h4>
          <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
            <li>Email: contact@waxprestige.com</li>
            <li>Tél: +228 98 79 70 93 </li>
            <li>Lomé, TOGO</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center text-neutral-500 text-sm">
        &copy; {new Date().getFullYear()} Wax Prestige. Tous droits réservés.
      </div>
    </footer>
  );
}
