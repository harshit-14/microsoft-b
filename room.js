const {v4}=require('uuid')

class Room {
    participants=[]
    roomId=null
    author=null

    constructor(body)
    {
        if(body.roomId)
        {
            this.roomId=body.roomId
        }
        else{
            this.roomId=v4();
        }
        
        this.author=body.author
    }

    addParticipants=(participantId)=>{
        this.participants.push(participantId)
    }
   
    removeParticipants=(participantId)=>{
        console.log('remove')
        let index=this.participants.findIndex(
            (existingParticipantId)=>existingParticipantId.id===participantId
        )
        //console.log('before-',this.participants)
        if(index>-1)
        {
            this.participants.splice(index,1)
            //console.log(this.participants)
        }
    }
    getInfo = () => ({
        participants: this.participants,
        roomId: this.roomId,
        author: this.author
    })
}

module.exports=Room;