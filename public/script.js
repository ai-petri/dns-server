document.querySelectorAll(".switch").forEach(el=>
{
    el.parentNode.addEventListener("click",e=>
    {
        if(el.classList.contains("on"))
        {
            el.classList.remove("on")
        }
        else
        {
            el.classList.add("on");
        }

        if(el.parentNode.classList.contains("on"))
        {
            el.parentNode.classList.remove("on");
        }
        else
        {
            el.parentNode.classList.add("on");
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