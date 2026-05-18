'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MemorySearch from '@/components/memory/MemorySearch';
import MemoryCard from '@/components/memory/MemoryCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function MemoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);

  // TODO: integrate search API to fetch sessions based on searchQuery

  return (
    <div className="container-main py-8">
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <h1 className="text-3xl font-bold text-accent-green mb-6">Memory Browser</h1>
      <MemorySearch onSearch={setSearchQuery} />
      <AnimatePresence>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {sessions.map((session) => (
              <MemoryCard key={session.id} session={session} />
            ))}
          </motion.div>
        </div>
      </AnimatePresence>
    </motion.div>
  </div>
  );
}