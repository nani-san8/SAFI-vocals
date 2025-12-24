import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useTracks() {
  return useQuery({
    queryKey: [api.tracks.list.path],
    queryFn: async () => {
      const res = await fetch(api.tracks.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tracks");
      return api.tracks.list.responses[200].parse(await res.json());
    },
    // Poll for updates every 5 seconds if there are pending/processing tracks
    refetchInterval: (query) => {
      const hasPending = query.state.data?.some(
        (t) => t.status === "pending" || t.status === "processing"
      );
      return hasPending ? 3000 : false;
    },
  });
}

export function useTrack(id: number) {
  return useQuery({
    queryKey: [api.tracks.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tracks.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch track");
      return api.tracks.get.responses[200].parse(await res.json());
    },
  });
}

export function useUploadTrack() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      const res = await fetch(api.tracks.create.path, {
        method: api.tracks.create.method,
        body: formData, // Browser automatically sets Content-Type to multipart/form-data
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.tracks.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to upload track");
      }
      return api.tracks.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tracks.list.path] });
      toast({
        title: "Upload Successful",
        description: "Your track is being processed. This may take a moment.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message,
      });
    },
  });
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tracks.delete.path, { id });
      const res = await fetch(url, {
        method: api.tracks.delete.method,
        credentials: "include",
      });
      if (res.status === 404) throw new Error("Track not found");
      if (!res.ok) throw new Error("Failed to delete track");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tracks.list.path] });
      toast({
        title: "Track Deleted",
        description: "The track has been permanently removed.",
      });
    },
  });
}
