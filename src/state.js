import { Provider, Subscribe, Container } from 'unstated'


class GlobalState extends Container {
    state={
        userInfo: null,
        selectedKeys: ["1"]
    }

    login = userInfo => this.setState({userInfo, selectedKeys: ["2"]})

    setKeys = e => this.setState({selectedKeys: [e]})

}

const g = new GlobalState()
export default g