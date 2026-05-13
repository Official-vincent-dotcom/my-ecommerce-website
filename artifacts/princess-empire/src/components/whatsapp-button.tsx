import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useGetSettings } from "@workspace/api-client-react";

export function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  const { data: settings } = useGetSettings();
  const phone = settings?.whatsappNumber ?? "+2348012345678";
  const url = `https://wa.me/${phone.replace(/\D/g, "")}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid="button-whatsapp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
    >
      {hovered && (
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-200">
          Chat with us on WhatsApp
        </div>
      )}
      <div className="w-14 h-14 rounded-full bg-[#25D366] shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center">
        <FaWhatsapp className="w-7 h-7 text-white" />
      </div>
    </a>
  );
}
