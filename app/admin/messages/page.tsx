"use client"

import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ContactMessage } from '@/types';
import { Loader2, Trash2, Mail, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContactMessage[];
      setMessages(fetched);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des messages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      try {
        await deleteDoc(doc(db, 'messages', id));
        toast.success("Message supprimé");
        fetchMessages();
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-10 h-10 animate-spin text-amber-600" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Messages de contact</h1>
        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-4 py-2 rounded-full font-bold text-sm">
          {messages.length} message(s)
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <Mail className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
          <h2 className="text-xl font-bold mb-2">Aucun message</h2>
          <p className="text-neutral-500">Vous n'avez reçu aucun message pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {messages.map((message) => (
            <div key={message.id} className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 flex flex-col relative group hover:shadow-md transition-shadow">
              <button 
                onClick={() => handleDelete(message.id)}
                className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Supprimer le message"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full text-amber-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{message.name}</h3>
                  <a href={`mailto:${message.email}`} className="text-amber-600 hover:underline text-sm font-medium flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {message.email}
                  </a>
                </div>
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex-1 mb-4">
                <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{message.message}</p>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <Calendar className="w-4 h-4" />
                {message.createdAt ? new Date(message.createdAt.toDate()).toLocaleString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : 'Date inconnue'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
