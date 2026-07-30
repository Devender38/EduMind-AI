const steps = [
  {
    number: "01",
    title: "Upload Your Documents",
    desc: "Upload textbooks, notes and PDFs securely."
  },
  {
    number: "02",
    title: "AI Understands Content",
    desc: "Our RAG based AI processes and understands your documents."
  },
  {
    number: "03",
    title: "Learn Faster",
    desc: "Generate notes, quizzes and get instant AI explanations."
  }
];


export default function HowItWorks(){

return(

<section className="py-24 px-6">


<h2 className="
text-4xl
font-bold
text-center
">

How EduMind AI Works

</h2>


<div className="
grid
md:grid-cols-3
gap-8
mt-12
">


{
steps.map((step)=>(

<div
key={step.number}
className="
glass
rounded-3xl
p-8
"
>


<div className="
text-5xl
font-bold
text-blue-400
">

{step.number}

</div>


<h3 className="
text-xl
font-bold
mt-5
">

{step.title}

</h3>


<p className="
text-gray-400
mt-3
">

{step.desc}

</p>


</div>

))
}


</div>


</section>

)

}