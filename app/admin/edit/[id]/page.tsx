import Editor from '@/components/Editor';

export default function EditPostPage({ params }: { params: { id: string } }) {
  return <Editor postId={params.id} />;
}
