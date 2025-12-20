"use client";

import { useState } from "react";
import { Bell, X, Check } from "lucide-react";
import { useUserInvitations, useAcceptInvitation, useRejectInvitation } from "@/hooks/api/useInvitation";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/shared/Toast";

const InvitationNotifications = ({ playerId }) => {
  const router = useRouter();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data: invitationsData, isLoading } = useUserInvitations(playerId, { status: "pending" });
  const acceptInvitation = useAcceptInvitation();
  const rejectInvitation = useRejectInvitation();

  const invitations = invitationsData?.data?.invitations || [];
  const hasInvitations = invitations.length > 0;

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

        toast.success("Invitation accepted! Redirecting to table...");
        router.push(`/table/${tableCode}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to accept invitation");
      },
    });
  };

  const handleReject = (invitationId) => {
    rejectInvitation.mutate(invitationId, {
      onSuccess: () => {
        toast.success("Invitation rejected");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to reject invitation");
      },
    });
  };

  if (!playerId) return null;

  return (
    <div className="relative left-20 ">
      {/* Bell Icon */}
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full hover:bg-accent/50 transition-colors">
        <Bell className={`w-6 h-6 ${hasInvitations ? "text-orange-500 animate-pulse" : "text-muted-foreground"}`} />
        {hasInvitations && <span className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse font-bold">{invitations.length}</span>}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ type: "spring", duration: 0.3 }} className="absolute right-0 mt-2 w-80  bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 z-50 max-h-[500px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border ">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-400" />
                Game Invitations
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-accent/50 transition-colors">
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-muted-foreground">Loading invitations...</p>
                </div>
              ) : invitations.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No pending invitations</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">You're all caught up!</p>
                </div>
              ) : (
                invitations.map((invitation) => (
                  <div key={invitation.id} className="p-4 hover:bg-accent/30 transition-colors">
                    {/* Invitation Info */}
                    <div className="mb-3">
                      <p className="font-bold text-foreground mb-1 flex items-center gap-2">{invitation.fromUserName} invited you!</p>
                      <p className="text-sm text-muted-foreground">{invitation.message}</p>
                    </div>

                    {/* Match Details */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-orange-500/10 rounded-xl p-3 mb-3 border border-purple-500/20">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Table Code</p>
                          <p className="font-mono font-bold text-purple-400">{invitation.tableCode}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Position</p>
                          <p className="font-bold text-foreground">Player {invitation.position}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Match Fee</p>
                          <p className="font-bold text-orange-400">৳ {invitation.matchFee}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Prize Pool</p>
                          <p className="font-bold text-green-400">৳ {invitation.prize}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button onClick={() => handleAccept(invitation.id, invitation.tableCode)} disabled={acceptInvitation.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-lg transition-all">
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button onClick={() => handleReject(invitation.id)} disabled={rejectInvitation.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-lg transition-all">
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs text-muted-foreground/70 mt-2 text-center">{new Date(invitation.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvitationNotifications;
