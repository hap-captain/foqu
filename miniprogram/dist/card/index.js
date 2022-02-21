
Component({
    inPersonPage(){
        console.log("ddddddd")
    },
    externalClasses: ['i-class'],

    options: {
        multipleSlots: true
    },

    properties: {
        full: {
            type: Boolean,
            value: false
        },
        thumb: {
            type: String,
            value: ''
        },
        userName: {
            type: String,
            value: ''
        },
        userInfo:{
            type:String,
            value:''
        },
        time: {
            type: String,
            value: ''
        }
    }
    
});
