export default {
    namespaced:true,
    name:'trEdit',
    state:{
        editFlag:{
            flag:true,
            index:0,
            trEditId:''
        }
    },
    mutations:{
        change(state, param) {
            state.editFlag.flag = !state.editFlag.flag
            state.editFlag.index = param.index
            state.editFlag.trEditId = param.trEditId ? param.trEditId : 'tr-edit'
        }
    }
}
