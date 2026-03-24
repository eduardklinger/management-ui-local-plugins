import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from "@workspace/ui/components";

import { moveEntry } from "../video-playlists.utils";

import type { PlaylistEditorDialogProps, PlaylistEntryDraft } from "../video-playlists.types";

export const PlaylistEditorDialog = ({
  open,
  onOpenChange,
  mode,
  form,
  setForm,
  availableEvents,
  eventTitleMap,
  aclEditorSlot,
  isSubmitting,
  onSubmit,
  onEpisodeSearch,
}: PlaylistEditorDialogProps) => {
  const [episodePickerOpen, setEpisodePickerOpen] = useState(false);

  const selectedEpisodeIds = useMemo(() => new Set(form.entries.map((entry) => entry.contentId)), [form]);

  const eventOptions = useMemo(
    () => availableEvents.filter((event) => !selectedEpisodeIds.has(event.id)),
    [availableEvents, selectedEpisodeIds],
  );

  const addEpisode = (event: { id: string }) => {
    setForm((current) => ({
      ...current,
      entries: [...current.entries, { contentId: event.id, type: "EVENT" }],
    }));
    setEpisodePickerOpen(false);
  };

  const removeEpisode = (index: number) => {
    setForm((current) => ({
      ...current,
      entries: current.entries.filter((_, entryIndex) => entryIndex !== index),
    }));
  };

  const reorderEpisode = (index: number, direction: "up" | "down") => {
    setForm((current) => ({
      ...current,
      entries: moveEntry(current.entries, index, direction),
    }));
  };

  const getEntryLabel = (entry: PlaylistEntryDraft): string => {
    if (entry.type !== "EVENT") {
      return `Inaccessible entry (${entry.contentId})`;
    }
    return eventTitleMap.get(entry.contentId) || entry.contentId;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-x-hidden overflow-y-auto sm:w-auto sm:max-w-[clamp(32rem,50vw,44rem)]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Playlist" : "Edit Playlist"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new playlist and arrange episodes in the desired order."
              : "Update playlist metadata, add or remove episodes, and reorder them."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${mode}-playlist-title`}>Title</Label>
            <Input
              id={`${mode}-playlist-title`}
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Playlist title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-playlist-description`}>Description</Label>
            <Textarea
              id={`${mode}-playlist-description`}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Playlist description"
              rows={3}
            />
          </div>

          {aclEditorSlot}

          <div className="space-y-2">
            <Label>Episodes</Label>
            <Popover open={episodePickerOpen} onOpenChange={setEpisodePickerOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Add episode
                </Button>
              </PopoverTrigger>
              <PopoverContent className="sidebar-portal-inside w-[420px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search episodes"
                    onValueChange={(value) => onEpisodeSearch(value)}
                  />
                  <CommandList>
                    <CommandEmpty>No episodes found.</CommandEmpty>
                    {eventOptions.map((event) => (
                      <CommandItem
                        key={event.id}
                        value={`${event.title || ""} ${event.id}`}
                        onSelect={() => addEpisode(event)}
                      >
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate">{event.title || event.id}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {event.seriesName || "No series"}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            {!form.entries.length ? (
              <p className="text-sm text-muted-foreground">No episodes selected.</p>
            ) : (
              form.entries.map((entry, index) => (
                <div
                  key={`${entry.contentId}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-md border p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{getEntryLabel(entry)}</p>
                    <p className="truncate text-xs text-muted-foreground">{entry.contentId}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Badge variant="secondary">{entry.type}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => reorderEpisode(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => reorderEpisode(index, "down")}
                      disabled={index >= form.entries.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEpisode(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="flex-wrap pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : mode === "create" ? (
              "Create Playlist"
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
