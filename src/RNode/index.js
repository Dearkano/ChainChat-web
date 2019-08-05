import React, {useState, useEffect} from 'react'
import { Tabs, Spin } from 'antd';
import {getRNodeInfo} from '../utils'
const { TabPane } = Tabs;

export default() => {
    const[key, setKey] = useState('0')
    const[loading, setLoading] = useState(false)
    const[data, setData] = useState('')
    useEffect(()=>{
        getDefaultInfo()
    },[])
    const getDefaultInfo = async function(){
        setLoading(true)
        const html =  await getRNodeInfo('http://10.6.71.75/9240')
        document.getElementById('rnode').innerHTML = html
        setLoading(false)
    }
    const callback = async(k) => {
        setLoading(true)
        let ip = ''
        switch(k){
            case '0': 
            ip = 'http://10.6.71.75/9240'
            break
            case '1':
            ip = 'http://10.6.71.79/9241'
            break
            default:
        }
        const html = await getRNodeInfo(ip)
        setKey(k)
        document.getElementById('rnode').innerHTML = html
        setLoading(false)
    }
    return (
        <>
        <Tabs onChange={callback} type="card">
            <TabPane tab="9240" key="0">
            </TabPane>
            <TabPane tab="9241" key="1">
            </TabPane>
        </Tabs>
        {loading&&<Spin size="large" />}
          <div id="rnode" style={{width:'800px',height:'1000px'}}></div>

                    </>
    )
}