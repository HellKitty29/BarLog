import { useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle, X } from "lucide-react";
import { profileApi } from "@/features/profile/profile.api";
import { uploadApi } from "@/features/upload/upload.api";
import { getDefaultAvatarDataUri } from "@/services/media/default-avatars";
import { resolveMediaUrl } from "@/services/media/resolve-media-url";
import type { User } from "@/types/domain";

type ProfileEditSheetProps = {
  user: User;
  open: boolean;
  onClose: () => void;
  onSaved: (user: User) => void;
};

export function ProfileEditSheet({ user, open, onClose, onSaved }: ProfileEditSheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setDisplayName(user.displayName);
    setAvatarPreview(null);
    setPendingAvatarUrl(undefined);
    setMessage("");
  }, [open, user.displayName, user.avatarUrl, user.id]);

  if (!open) {
    return null;
  }

  const currentAvatarSrc =
    avatarPreview ??
    (user.avatarUrl ? resolveMediaUrl(user.avatarUrl) : getDefaultAvatarDataUri(user.id || user.email || user.displayName));

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setMessage("Image must be 8 MB or smaller.");
      return;
    }

    setMessage("Uploading photo...");
    setSaving(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      const formData = new FormData();
      formData.append("file", file);
      const upload = await uploadApi.uploadImage(formData);
      setPendingAvatarUrl(upload.imageUrl);
      setMessage("");
    } catch (error) {
      setAvatarPreview(null);
      setPendingAvatarUrl(undefined);
      setMessage(error instanceof Error ? error.message : "Unable to upload avatar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    const trimmedName = displayName.trim();
    if (trimmedName.length < 2) {
      setMessage("Display name must be at least 2 characters.");
      return;
    }

    const payload: { displayName?: string; avatarUrl?: string } = {};
    if (trimmedName !== user.displayName) {
      payload.displayName = trimmedName;
    }
    if (pendingAvatarUrl && pendingAvatarUrl !== user.avatarUrl) {
      payload.avatarUrl = pendingAvatarUrl;
    }
    if (!payload.displayName && !payload.avatarUrl) {
      setMessage("Change your name or avatar before saving.");
      return;
    }

    setSaving(true);
    setMessage("Saving profile...");
    try {
      const updated = await profileApi.updateMe(payload);
      onSaved({ ...user, ...updated, displayName: updated.displayName || trimmedName });
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-edit-scrim" role="dialog" aria-modal="true" aria-label="Edit profile">
      <button className="profile-edit-scrim-hit" type="button" aria-label="Close edit profile" onClick={onClose} />
      <section className="profile-edit-sheet">
        <header className="profile-edit-header">
          <h3>Edit Profile</h3>
          <button className="profile-edit-close" type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="profile-edit-avatar-block">
          <button
            className="profile-edit-avatar-button"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={saving}
          >
            <img className="profile-edit-avatar" src={currentAvatarSrc} alt="" />
            <span className="profile-edit-avatar-badge">
              <Camera size={16} />
            </span>
          </button>
          <p>Tap to upload a new avatar</p>
          <input
            ref={fileInputRef}
            accept="image/*"
            className="profile-edit-file-input"
            type="file"
            onChange={handleFileChange}
          />
        </div>

        <label className="profile-edit-field">
          <span>Display name</span>
          <input
            maxLength={40}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Choose a nickname"
          />
        </label>

        {message ? <p className="profile-edit-message">{message}</p> : null}

        <footer className="profile-edit-actions">
          <button className="profile-edit-cancel" type="button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="profile-edit-save" type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? <LoaderCircle className="spin-icon" size={16} /> : null}
            Save
          </button>
        </footer>
      </section>
    </div>
  );
}
