"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu, IconX } from "@/components/icons";

// Nav links just vanished below sm with no fallback, this is that fallback.
export function MobileMenu({ links }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <IconX width={18} height={18} /> : <IconMenu width={20} height={20} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-4 right-4 top-full mt-2 solid-overlay rounded-lg p-2 flex flex-col z-50"
          >
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm text-text-muted hover:text-text hover:bg-white/5 rounded-md transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm text-text-muted hover:text-text hover:bg-white/5 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
