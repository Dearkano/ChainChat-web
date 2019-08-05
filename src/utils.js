export async function getFileInfo(afid){
    const res = await fetch(`http://39.100.9.55:8035/getFileInfo?afid=${afid}`)
    if(res.status===200){
        const data = await res.json()
        return data
    }else{
        return null
    }
}

export async function getRNodeInfo(ip){
    const res = await fetch(`http://39.100.9.55:8035/getRNodeInfo?ip=${ip}`)
    if(res.status===200){
        const data = await res.text()
        return data
    }else{
        return null
    }
}