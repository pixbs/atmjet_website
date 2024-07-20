'use client'

import Logo from '@/assets/svg/logo.svg'
import { motion } from 'framer-motion';

export function Preloader () {
  return <>
    <motion.div 
        className='bg-gray-150 fixed z-[998] inset-0 items-center justify-center'
        initial={{ opacity: 1, height: '100%', display : 'flex' }}
        animate={{ 
            opacity: 0, 
            height: '0%',
            display : 'none'
        }}
        transition={{ duration: 0.5, delay: 2 }}
    >
    </motion.div>
    <motion.div
            className='fixed inset-0 flex items-center justify-center z-[999]'
            initial={{ opacity: 0, y: -40 }}
            animate={{ 
                opacity: [0, 1, 1, 1, 0, 0], 
                y: [-40, 0, 0, -40, -40, -40],
                display : ['none', 'flex', 'flex', 'flex', 'none', 'none']
            }}
            transition={{ duration: 4 }}
        >
            <Logo className='w-[60vw] max-w-sm text-gray-900' />
        </motion.div>
    </>
}