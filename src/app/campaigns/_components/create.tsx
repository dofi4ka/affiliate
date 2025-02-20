import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useToast} from "@/hooks/use-toast";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import React, {useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {env} from "@/env.mjs";
import CampaignFormSchema from "@/app/campaigns/_components/campaignFormSchema";
import {Campaign} from "@/app/campaigns/_components/table";


export function CreateDialog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (newCampaign: z.infer<typeof CampaignFormSchema>) => {
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/campaign`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(newCampaign),
        }
      );
      if (!res.ok) {
        throw new Error("Error creating campaign");
      }
      return res.json();
    },
    onMutate: async (newCampaign) => {
      await queryClient.cancelQueries({ queryKey: ["campaigns"] });
      const previousCampaigns = queryClient.getQueryData<Campaign[]>(["campaigns"]);
      queryClient.setQueryData(["campaigns"], (old: Campaign[] = []) => [
        ...old, { ...newCampaign, id: "undefined", createdAt: new Date() },
      ]);
      setOpen(false);
      return { previousCampaigns };
    },
    onError: (error, newCampaign, context: { previousCampaigns: unknown; } | undefined) => {
      queryClient.setQueryData(["campaigns"], context?.previousCampaigns);
      toast({
        title: "Error",
        description: "Failed to create campaign. Rolling back changes.",
      });
      setOpen(true);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setOpen(false);
    },
    onSuccess: (data) => {
      toast({
        title: "Campaign created",
        description: `Campaign ${data.name} successfully created.`,
      });
    },
  });

  const form = useForm<z.infer<typeof CampaignFormSchema>>({
    resolver: zodResolver(CampaignFormSchema),
    defaultValues: {
      name: "",
      budget: 0,
      status: "",
    },
  })

  function onSubmit(data: z.infer<typeof CampaignFormSchema>) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Create campaign</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create campaign</DialogTitle>
          <DialogDescription>
            Click create when you are done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign name</FormLabel>
                  <FormControl>
                    <Input placeholder="Cool campaign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="paused">paused</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Create</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}