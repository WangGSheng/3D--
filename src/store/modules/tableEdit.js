export default {
    namespaced:true,
    name:'tableEdit',
    state:{
        trIdx:null,
        trDb:null,
        trEdited:null,
        topAccordion:null,
    },
    mutations:{
        setTrIdx(state, val) {
            state.trIdx = val
        },
        setTrDb(state, val) {
            state.trDb = val
        },
        setTrEdited(state, val) {
            state.trEdited = val
        },
        settopAccordion(state, val) {
            state.topAccordion = val
        },
    },
}
