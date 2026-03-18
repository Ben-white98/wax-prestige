import { MapPin, Navigation, MessageCircle, Store } from "lucide-react";
import Link from "next/link";

export function StoreLocation() {
  // Coordonnées et informations de la boutique
  const locationQuery = "65MM+GFR Lomé, Togo";
  const encodedLocation = encodeURIComponent(locationQuery);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`;

  // Numéro WhatsApp (à remplacer par le vrai numéro)
  const whatsappNumber = "22898797093";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Bonjour,%20je%20souhaite%20avoir%20des%20informations%20sur%20vos%20articles.`;

  return (
    <section className="py-16 bg-neutral-50 dark:bg-neutral-900/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Venez nous rendre visite
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-lg">
              Découvrez nos collections de pagnes directement dans notre
              boutique à Lomé.
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row">
            {/* Carte Google Maps */}
            <div className="w-full md:w-3/5 h-[300px] md:h-auto relative">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
                title="Carte de la boutique Wax Prestige"
              ></iframe>
            </div>

            {/* Informations et boutons */}
            <div className="w-full md:w-2/5 p-8 md:p-10 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6 w-fit">
                <Store className="w-4 h-4" />
                Retrait en boutique disponible
              </div>

              <h3 className="text-2xl font-bold mb-2">Boutique Wax Prestige</h3>

              <div className="flex items-start gap-3 text-neutral-600 dark:text-neutral-400 mb-8">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
                <p className="leading-relaxed">
                  65MM+GFR
                  <br />
                  Lomé, Togo
                </p>
              </div>

              <div className="space-y-4 mt-auto">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Navigation className="w-5 h-5" />
                  Voir l'itinéraire
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contacter sur WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
