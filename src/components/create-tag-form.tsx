import { Check, Loader2, X } from "lucide-react";
import { Button } from "./ui/button";
import { useForm, } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from "@tanstack/react-query";

const createTagSchema = z.object({
  title: z.string().min(3, { message: 'Minimium 3 characters.' }),
})

type CreateTagSchema = z.infer<typeof createTagSchema>

export function CreateTagForm() {

  const queryClient = useQueryClient()

  const { register, handleSubmit, watch, formState } = useForm<CreateTagSchema>({
    resolver: zodResolver(createTagSchema)
  })

  const generatedSlug = watch('title')
    ? getSlugFromString(watch('title'))
    : '';

  const { mutateAsync } = useMutation({
    mutationFn: async ({ title }: CreateTagSchema) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      await fetch('http://localhost:3333/tags', {
        method: 'POST',
        body: JSON.stringify({
          title,
          generatedSlug,
          amountOfVideos: 0
        })
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-tags']
      })
    }
  })

  async function createTag({ title }: CreateTagSchema) {
    await mutateAsync({ title })
  }

  function getSlugFromString(input: string): string {
    return input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
  }


  return (
    <form onSubmit={handleSubmit(createTag)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="block text-small font-medium">Tag Name</label>
        <input
          {...register('title')}
          id="name"
          type="text"
          className="border border-zinc-800 rounded-lg px-3 py-2 bg-zinc-800/50 w-full"
        />
        {formState.errors?.title && (
          <p className="text-red-400 text-small">{formState.errors.title.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <label className="block text-small font-medium" htmlFor="slug">Slug</label>
        <input
          id='slug'
          value={generatedSlug}
          type="text"
          readOnly
          className="border border-zinc-800 rounded-lg px-3 py-2 bg-zinc-800/50 w-full"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <DialogClose asChild>
          <Button>
            <X className="size-3" />
            Cancel
          </Button>
        </DialogClose>
        <Button disabled={formState.isSubmitting} className="bg-teal-400 text-teal-950">
          {formState.isSubmitting ?
            <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />
          }
          Save
        </Button>
      </div>
    </form>
  )
}