// components/ActionDropdown.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "@/components/ActionsModalContent";
import {ActionType} from "@/types";

const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name.split('.')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);

  const path = usePathname();

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name.split('.')[0]);
    setEmails([]);
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);
    let success = false;

    try {
      const actions = {
        rename: () =>
          renameFile({ fileId: file.$id, name, extension: file.extension, path }),
        share: () => updateFileUsers({ fileId: file.$id, emails, path }),
        delete: () =>
          deleteFile({
            fileId: file.$id,
            bucketFileId: file.bucketFileID,
            path,
          }),
      };

      const result = await actions[action.value as keyof typeof actions]();
      if (result) success = true;

    } catch (error) {
      console.error("Action failed", error);
      success = false;
    } finally {
      setIsLoading(false);
      if (success) closeAllModals();
    }
  };

  const handleRemoveUser = async (email: string) => {
    const updatedEmails = emails.filter((e) => e !== email);
    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });
    if (success) setEmails(updatedEmails);
  };

  const renderDialogContent = () => {
    if (!action) return null;
    const { value, label } = action;

    return (
      <DialogContent className="shad-dialog">
        <DialogHeader>
          <DialogTitle className="text-center text-light-100">{label}</DialogTitle>
        </DialogHeader>
        {value === "rename" && <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />}
        {value === "details" && <FileDetails file={file} />}
        {value === "share" && <ShareInput file={file} onInputChange={setEmails} onRemove={handleRemoveUser} />}
        {value === "delete" && <p className="delete-confirmation">Are you sure you want to delete <span className="delete-file-name">{file.name}</span>?</p>}

        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModals}  className="modal-cancel-button">Cancel</Button>
            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{value}</p>
              {isLoading && <Image src="/assets/icons/loader.svg" alt="loader" width={16} height={16} className="animate-spin" />}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <Image src="/assets/icons/dots.svg" alt="dots" width={20} height={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">{file.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              onClick={() => {
                if (actionItem.value !== 'download') {
                  setAction(actionItem);
                  setIsModalOpen(true);
                }
              }}
            >
              {actionItem.value === "download" ? (
                <Link href={constructDownloadUrl(file.bucketFileID)} download={file.name} className="flex items-center gap-2">
                  <Image src={actionItem.icon} alt={actionItem.label} width={20} height={20} />
                  {actionItem.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image src={actionItem.icon} alt={actionItem.label} width={20} height={20} />
                  {actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};
export default ActionDropdown;