"use client";

import { useState } from "react";
import { Bell, X, Check } from "lucide-react";
import { useUserInvitations, useAcceptInvitation, useRejectInvitation } from "@/hooks/api/useInvitation";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const InvitationNotifications = ({ playerId }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { data: invitationsData, isLoading } = useUserInvitations(playerId, { status: "pending" });
  const acceptInvitation = useAcceptInvitation();
  const rejectInvitation = useRejectInvitation();

  const invitations = invitationsData?.data?.invitations || [];
  const hasInvitations = invitations.length > 0;

  const handleAccept = (invitationId, tableCode) => {
    acceptInvitation.mutate(invitationId, {
      onSuccess: (data) => {
        console.log("Invitation accepted:", data);
        alert("Invitation accepted! Redirecting to table...");
        router.push(`/table/${tableCode}`);
      },
      onError: (error) => {
        console.error("Error accepting invitation:", error);
        alert(error.response?.data?.message || "Failed to accept invitation");
      },
    });
  };

  const handleReject = (invitationId) => {
    if (!confirm("Are you sure you want to reject this invitation?")) {
      return;
    }

    rejectInvitation.mutate(invitationId, {
      onSuccess: () => {
        console.log("Invitation rejected");
      },
      onError: (error) => {
        console.error("Error rejecting invitation:", error);
        alert(error.response?.data?.message || "Failed to reject invitation");
      },
    });
  };

  if (!playerId) return null;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className={`w-6 h-6 ${hasInvitations ? "text-orange-500" : "text-gray-600"}`} />
        {hasInvitations && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {invitations.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Game Invitations</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  Loading invitations...
                </div>
              ) : invitations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No pending invitations</p>
                </div>
              ) : (
                invitations.map((invitation) => (
                  <div key={invitation.id} className="p-4 hover:bg-gray-50">
                    {/* Invitation Info */}
                    <div className="mb-3">
                      <p className="font-semibold text-gray-900 mb-1">
                        {invitation.fromUserName} invited you to play!
                      </p>
                      <p className="text-sm text-gray-600">{invitation.message}</p>
                    </div>

                    {/* Match Details */}
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Table Code</p>
                          <p className="font-mono font-semibold text-blue-600">
                            {invitation.tableCode}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Position</p>
                          <p className="font-semibold text-gray-900">
                            Player {invitation.position}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Match Fee</p>
                          <p className="font-semibold text-gray-900">₹{invitation.matchFee}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Prize Pool</p>
                          <p className="font-semibold text-green-600">₹{invitation.prize}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(invitation.id, invitation.tableCode)}
                        disabled={acceptInvitation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(invitation.id)}
                        disabled={rejectInvitation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(invitation.createdAt).toLocaleString()}
                    </p>
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
