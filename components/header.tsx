/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { motion } from "framer-motion";
export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="roomInfo w-full sm:w-fit">
        <div className="roomName w-full flex justify-between items-center">
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
        </div>
      </div>
    </motion.header>
  );
}
