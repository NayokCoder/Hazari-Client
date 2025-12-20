"use client";

import { useState, useEffect } from "react";
import { X, Check, GamepadIcon, Trophy } from "lucide-react";
import { useUserInvitations, useAcceptInvitation, useRejectInvitation } from "@/hooks/api/useInvitation";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/shared/Toast";

const FloatingNotifications = ({ playerId }) => {
  const router = useRouter();
  const toast = useToast();
  const [dismissedInvitations, setDismissedInvitations] = useState(new Set());

  const { data: invitationsData, isLoading } = useUserInvitations(playerId, { status: "pending" });
  const acceptInvitation = useAcceptInvitation();
  const rejectInvitation = useRejectInvitation();

  const invitations = invitationsData?.data?.invitations || [];

  // Filter out dismissed invitations
  const visibleInvitations = invitations.filter(inv => !dismissedInvitations.has(inv.id));

  const handleAccept = (invitationId, tableCode) => {
    acceptInvitation.mutate(invitationId, {
      onSuccess: (data) => {
        // Update user balance if returned
        if (data.data?.newBalance !== undefined) {
          const currentUser = localStorage.getItem("hazari-current-user");
          if (currentUser) {
            const user = JSON.parse(currentUser);
            const updatedUser = { ...user, balance: data.data.newBalance };
            localStorage.setItem("hazari-current-user", JSON.stringify(updatedUser));

            // Notify other components
            window.dispatchEvent(new Event("userUpdated"));
          }
        }

        // Add to dismissed list
        setDismissedInvitations(prev => new Set([...prev, invitationId]));

        // Redirect to table
        setTimeout(() => {
          router.push(`/table/${tableCode}`);
        }, 500);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to accept invitation");
      },
    });
  };

  const handleReject = (invitationId) => {
    rejectInvitation.mutate(invitationId, {
      onSuccess: () => {
        // Add to dismissed list
        setDismissedInvitations(prev => new Set([...prev, invitationId]));
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to reject invitation");
      },
    });
  };

  const handleDismiss = (invitationId) => {
    setDismissedInvitations(prev => new Set([...prev, invitationId]));
  };

  if (!playerId || isLoading) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full space-y-3 pointer-events-none">
      <AnimatePresence>
        {visibleInvitations.map((invitation, index) => (
          <motion.div
            key={invitation.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              delay: index * 0.1
            }}
            className="pointer-events-auto glass-card border-2 border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-orange-500 to-purple-600 p-4 relative shadow-lg">
              <button
                onClick={() => handleDismiss(invitation.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <GamepadIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">Game Invitation!</h3>
                  <p className="text-white/90 text-sm">{invitation.fromUserName} invited you</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 bg-card/95 backdrop-blur-md">
              {/* Message */}
              <p className="text-foreground text-sm mb-3 font-medium">{invitation.message}</p>

              {/* Game Details */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-purple-500/10 rounded-lg p-2 border border-purple-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Table Code</p>
                  <p className="font-mono font-bold text-purple-400 text-sm">{invitation.tableCode}</p>
                </div>
                <div className="bg-orange-500/10 rounded-lg p-2 border border-orange-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Position</p>
                  <p className="font-bold text-orange-400 text-sm">Player {invitation.position}</p>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Match Fee</p>
                  <p className="font-bold text-foreground text-sm">৳ {invitation.matchFee}</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Prize Pool</p>
                  <p className="font-bold text-green-400 text-sm flex items-center gap-1">
                    <Trophy className="w-3 h-3" />৳ {invitation.prize}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(invitation.id, invitation.tableCode)}
                  disabled={acceptInvitation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all hover:scale-105"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </button>
                <button
                  onClick={() => handleReject(invitation.id)}
                  disabled={rejectInvitation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all hover:scale-105"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground text-center mt-3">
                {new Date(invitation.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FloatingNotifications;
