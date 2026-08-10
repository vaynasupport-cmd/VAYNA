import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface LogoutConfirmationModalProps {
  children: React.ReactNode;
}

export function LogoutConfirmationModal({ children }: LogoutConfirmationModalProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      // On navigue d'abord vers la page d'accueil
      navigate('/');
      
      // On attend un tout petit peu pour que la navigation se fasse,
      // puis on déconnecte l'utilisateur pour éviter que ProtectedRoute 
      // intercepte la déconnexion et redirige vers /login
      setTimeout(async () => {
        await signOut();
      }, 50);
    } catch (error: any) {
      console.error("Erreur de déconnexion", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="w-full max-w-sm mx-4 bg-card border border-border rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-0">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        
        <AlertDialogHeader className="w-full">
          <AlertDialogTitle className="text-lg font-semibold text-center mb-2 w-full">
            Mettre fin à la session ?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground text-center mb-6">
            Vous allez être déconnecté de votre espace VAYNA. Vos données sont sauvegardées et vous pourrez vous reconnecter à tout moment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="w-full flex gap-3 sm:space-x-0">
          <AlertDialogCancel className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-accent transition-colors bg-transparent mt-0 h-auto">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSignOut}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors h-auto border-0"
          >
            Se déconnecter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
