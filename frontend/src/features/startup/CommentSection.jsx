import { useState } from "react";

const CommentSection = ({startup}) => {

const [comments,setComments]=useState(startup.comments || []);
const [text,setText]=useState("");

const addComment=()=>{

if(!text.trim()) return;

setComments([...comments,text]);
setText("");

};

return(

<div className="mt-10">

<h2 className="text-xl font-bold mb-4">
Comments
</h2>

<div className="flex gap-2">

<input
value={text}
onChange={(e)=>setText(e.target.value)}
placeholder="Write a comment..."
className="border rounded px-3 py-2 flex-1"
/>

<button
onClick={addComment}
className="bg-blue-600 text-white px-4 rounded"
>
Post
</button>

</div>

<div className="mt-5 space-y-3">

{comments.map((c,i)=>(
<div
key={i}
className="bg-gray-100 p-3 rounded"
>
{c}
</div>
))}

</div>

</div>

);

};

export default CommentSection;