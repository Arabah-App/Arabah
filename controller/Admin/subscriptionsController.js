const subscriptions = require('../../Model/subscriptions')

module.exports = {

    createSubscription: async(req, res)=> {
        try {
            const addsubscription = await subscriptions.create({
                name: req.body.name,
                price: req.body.price,
                tenure: req.body.tenure
            })

            res.json(addsubscription)
        } catch (error) {
            console.log(error)
        }
    },

    subscriptionList: async(req, res)=> {
        try {
            let title = "subscriptionList"
            const subscriptionsData = await subscriptions.find()
            res.render('Admin/subscription/subscriptionList', {title, subscriptionsData, session:req.session.user,  msg: req.flash('msg')})
        } catch (error) {
            console.log(error)
        }
    },

    viewSubscription: async(req, res)=> {
        try {
            let title = "subscriptionList"
            const subdetails = await subscriptions.findById({_id: req.params.id})
            res.render('Admin/subscription/viewSubscription', { title, subdetails, session:req.session.user,  msg: req.flash('msg')})
        } catch (error) {
            console.log(error)
        }
    },

    editSubscription: async(req, res)=> {
        try {
            let title = "subscriptionList"
            const subsdetail = await subscriptions.findById({_id: req.params.id})
            res.render('Admin/subscription/editSubscription', {title, subsdetail, session:req.session.user,  msg: req.flash('msg')})
        } catch (error) {
           console.log(error) 
        }
    },

    updateSubscription: async(req, res)=> {
        try {
            const updateData = await subscriptions.updateOne({_id: req.body.id},
                
                {   name: req.body.name,
                    price: req.body.price,
                    tenure:req.body.tenure
                })
            res.redirect("/subscriptionList")
        } catch (error) {
           console.log(error) 
        }
    },
   
    deleteSubscription: async(req, res)=> {
        try {
            let userId = req.body.id 
            const removesubs = await subscriptions.deleteOne({_id: userId})
            res.redirect("/subscriptionList") 
        } catch (error) {
                console.log(error)
        }
    },

    subsStatus: async (req, res) => {
        try {
            var check = await activityModel.updateOne(
            { _id: req.body.id },
            { status: req.body.value }
            );
            req.flash("msg", "Status update successfully");
            
            if (req.body.value == 0) res.send(false);
            if (req.body.value == 1) res.send(true);
        
            } catch (error) {
            console.log(error)
            }
    },



}