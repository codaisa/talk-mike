/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { motion } from "framer-motion";
import { Share2, Check } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  roomId?: string;
  showShareButton?: boolean;
}

export default function Header({
  roomId,
  showShareButton = false,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!roomId) return;

    const shareUrl = `${window.location.origin}?roomId=${roomId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="w-full flex justify-between items-center">
        <motion.a
          href="https://app.academe.com.br"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <motion.img
            src="/academe-logo.png"
            alt="Academe Logo"
            style={{
              height: "25px",
              marginRight: "10px",
              cursor: "pointer",
            }}
          />
        </motion.a>

        {showShareButton && roomId && (
          <motion.button
            onClick={handleShare}
            className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {copied ? (
              <>
                <Check size={16} />
                Copiado!
              </>
            ) : (
              <>
                <Share2 size={16} />
                Compartilhar
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.header>
  );
}
