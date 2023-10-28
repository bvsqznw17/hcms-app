<script>
export default {
    name: "Content",
    props: {
        panes: {
            type: Array,
            default: function() {
                return [];
            }
        }
    },
    render() {
        return (
            <div>
                {
                    this.panes.map((element,index) => {
                        return element.active ? element.$slots.default : "" ;
                    })
                }
            </div>
        );
    }
};
</script>
 
<style scoped>
</style>
 