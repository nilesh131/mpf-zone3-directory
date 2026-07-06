import { getMembers } from "../core/state.js";

export function renderDashboard() {

    const members = getMembers();

    animate("memberCount", members.length);

    animate("chapterCount", unique(members,"chapter"));

    animate("industryCount", industryCount(members));

}

function unique(data,key){

    return new Set(

        data
        .map(m=>m[key])
        .filter(Boolean)

    ).size;

}

function industryCount(data){

    const list=[];

    data.forEach(member=>{

        if(!member.industry)
            return;

        member.industry
            .split(";")
            .forEach(i=>{

                i=i.trim();

                if(i)
                    list.push(i);

            });

    });

    return new Set(list).size;

}

function animate(id,target){

    const element=document.getElementById(id);

    if(!element)
        return;

    let value=0;

    const increment=Math.max(1,Math.ceil(target/40));

    const timer=setInterval(()=>{

        value+=increment;

        if(value>=target){

            value=target;

            clearInterval(timer);

        }

        element.innerHTML=value;

    },20);

}