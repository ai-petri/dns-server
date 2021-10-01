document.querySelectorAll(".switch").forEach(el=>
{
    el.parentNode.addEventListener("click",e=>
    {
        if(el.classList.contains("on"))
        {
            el.classList.remove("on");
            fetch("/api/server/disable").then(r=>r.json()).then(obj=>{

                if(obj.enabled == false && el.parentNode.classList.contains("on"))
                {
                    el.parentNode.classList.remove("on");
                }

            });        
        }
        else
        {
            el.classList.add("on");
            fetch("/api/server/enable").then(r=>r.json()).then(obj=>{

                if(obj.enabled == true && !el.parentNode.classList.contains("on"))
                {
                    el.parentNode.classList.add("on");
                }

            });           
        }

    })
});

getRecords();


function getRecords()
{
    fetch("/api/records").then(r=>r.json()).then(obj=>{
        let entries = Object.entries(obj);
        let list = document.querySelector("#records");
        list.innerHTML = "";
        for(let entry of entries)
        {
            let li = document.createElement("li");
            li.innerText = `${entry[0]} ${entry[1]}`;
            list.append(li);
        }

    });
}