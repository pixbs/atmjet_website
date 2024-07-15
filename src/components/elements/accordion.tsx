'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AccordionProps {
    title : string;
    i: number;
    expanded: false | number;
    setExpanded: React.Dispatch<React.SetStateAction<number | false>>;
    children: React.ReactNode;
    className?: string;
}

export function Accordion(props: AccordionProps) {
    const { i, expanded, setExpanded, children, title, className } = props;
    const isOpen = i === expanded;

    // By using `AnimatePresence` to mount and unmount the contents, we can animate
    // them in and out while also only rendering the contents of open accordions
    return (
        <>
            <motion.p
                initial={false}
                animate={{ opacity: isOpen ? "80%" : "100%" }}
                onClick={() => setExpanded(isOpen ? false : i)}
                className={className}
            >
                {title}
            </motion.p>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
