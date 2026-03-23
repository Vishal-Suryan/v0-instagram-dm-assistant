'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import type { Tag as TagType } from '@/lib/types/database'

const TAG_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
]

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[4].value)
  const supabase = createClient()

  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching tags:', error)
    } else {
      setTags(data || [])
    }
    setIsLoading(false)
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('tags').insert({
      user_id: user.id,
      name: newTagName.trim(),
      color: newTagColor,
    })

    if (error) {
      console.error('Error creating tag:', error)
    } else {
      setNewTagName('')
      setNewTagColor(TAG_COLORS[4].value)
      setIsCreateOpen(false)
      fetchTags()
    }
  }

  async function handleUpdateTag() {
    if (!editingTag || !newTagName.trim()) return

    const { error } = await supabase
      .from('tags')
      .update({
        name: newTagName.trim(),
        color: newTagColor,
      })
      .eq('id', editingTag.id)

    if (error) {
      console.error('Error updating tag:', error)
    } else {
      setEditingTag(null)
      setNewTagName('')
      setNewTagColor(TAG_COLORS[4].value)
      fetchTags()
    }
  }

  async function handleDeleteTag(tagId: string) {
    const { error } = await supabase.from('tags').delete().eq('id', tagId)

    if (error) {
      console.error('Error deleting tag:', error)
    } else {
      fetchTags()
    }
  }

  function openEditDialog(tag: TagType) {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagColor(tag.color)
  }

  function closeEditDialog() {
    setEditingTag(null)
    setNewTagName('')
    setNewTagColor(TAG_COLORS[4].value)
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tags</h1>
            <p className="text-muted-foreground">Organize your conversations with custom tags</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
                <DialogDescription>Add a new tag to organize your conversations</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tag-name">Tag Name</Label>
                  <Input
                    id="tag-name"
                    placeholder="e.g., VIP Customer"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewTagColor(color.value)}
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          newTagColor === color.value
                            ? 'border-foreground scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <Label>Preview</Label>
                  <div className="mt-2">
                    <Badge
                      variant="secondary"
                      className="text-white"
                      style={{ backgroundColor: newTagColor }}
                    >
                      {newTagName || 'Tag Name'}
                    </Badge>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
                  Create Tag
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-6 bg-muted rounded w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tags.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No tags yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first tag to start organizing conversations
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {tags.map((tag) => (
              <Card key={tag.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={editingTag?.id === tag.id} onOpenChange={(open) => !open && closeEditDialog()}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(tag)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Tag</DialogTitle>
                          <DialogDescription>Update your tag details</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-tag-name">Tag Name</Label>
                            <Input
                              id="edit-tag-name"
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                              {TAG_COLORS.map((color) => (
                                <button
                                  key={color.value}
                                  onClick={() => setNewTagColor(color.value)}
                                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                                    newTagColor === color.value
                                      ? 'border-foreground scale-110'
                                      : 'border-transparent hover:scale-105'
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={closeEditDialog}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateTag} disabled={!newTagName.trim()}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{tag.name}"? This will remove the tag from all conversations.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTag(tag.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
