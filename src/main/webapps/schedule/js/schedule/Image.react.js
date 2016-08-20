var React = require("react");
var PageStores = require("../page/stores/PageStores");
var ScheduleStore = require("./ScheduleStore");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink;
var TypeStore = require("./TypeStore");
var tokenUrl ="UPLOAD_AK_TOP MjMyNDg0OTE6ZXlKa1pYUmxZM1JOYVcxbElqb3hMQ0psZUhCcGNtRjBhVzl1SWpveE5EY3hNRGd3TVRjd05qTTJMQ0pwYm5ObGNuUlBibXg1SWpvd0xDSnVZVzFsSWpvaUpIdDVaV0Z5ZlMwa2UyMXZiblJvZlMwa2UyUmhlWDB0Skh0b2IzVnlmUzBrZTIxcGJuVjBaWDB0Skh0elpXTnZibVI5TFNSN1ptbHNaVk5wZW1WOUxpUjdaWGgwZlNJc0ltNWhiV1Z6Y0dGalpTSTZJbmhyYlNJc0luTnBlbVZNYVcxcGRDSTZNSDA6ODFhNWNkNGVlZGM5OTMzZTgxZTI0YjcwMzJlMzI4NzFmOTJiY2FiYg";
var uploadUrl = "https://upload.media.aliyun.com/api/proxy/upload";
var token={
    time:new Date().getTime(),
    value:"",
}

var Image = React.createClass({
    baifenbi1: 0,
    addImg_urls: [],
    uploadedImgsView:[],
    imgListView:[],
    imgList:[],
    getInitialState: function () {
        var data = {};
        return data;
    },
    componentWillMount:function() {
        if($.isArray(this.props.imgList)) {
            this.imgList = this.props.imgList;
        }
    },
    componentDidMount: function () {
    },
    uploadImgs:function() {
        var ts = new Date().getTime();
        var host = ScheduleStore.getHost();
        var tokenUrl ="";
        var self = this;
        if(token==null||isNullOrEmpty(token.value)||ts-token.time>12*60*1000) {
            getData(ScheduleStore.getHost()+"/rest/media/token/v1", {},function(d){
                if(d.responseMsg == "1") {
                    token.time =  new Date().getTime();
                    token.value = d.id;
                    self.initUpload();
                } else {
                    alert("获取授权失败,请重试");
                }
            },function(v1,v2,v3) {});
        }
        else {
            self.initUpload();
        }
        $('#up_img').bind('fileuploadsubmit', function (e, data) {
            if($.isArray(data.files)&& data.files.length>0) {
                var file = data.files[0];
                data.formData = [
                    {
                        name: 'dir',
                        value: '/xkmPic',
                    }, {
                        name: "name",
                        value: file.name,
                    }, {
                        name: 'size',
                        value: file.size,
                    }
                ];  //如果需要额外添加参数可以在这里添加
            }

        });
    },
    initUpload: function() {
        var self = this;
        $('#up_img').fileupload({
            url:uploadUrl,
            dataType: 'json',
            headers:{"Authorization":token.value,"UserAgent":"ALIMEDIASDK_JSSDK"},
            progressall: function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                $('#progress .bar').css(
                    'width',
                    progress + '%'
                );
            },
            done: function (e, data) {
                if(data.result.code=="OK") {
                    self.pushImg(data.result.url);
                    if($.isFunction(self.props.addImgs)) {
                        self.props.addImgs(self.imgList);
                    }
                }
            }
        });
    },
    pushImg:function(url) {
        this.imgList.push(url);
        this.setState({"imgList":this.imgList});
    },
    componentWillUnmount: function () {
    },
    renderUploadImg:function() {
        var html = [];
        var self = this;
        var isEdit = self.props.isEdit;
        _.each( self.imgList, function(t){
            html.push(
                <dd>
                    <i data-url={t}  onClick={self.delectitImg} className={"fa fa-times "+(isEdit?"":"hide")}
                       aria-hidden="true"
                    ></i>
                    <img src={t} />
                </dd>);
        })
        return html;
    },
    /******************************/
    /*         删除图片
     /******************************/
    delectitImg: function (event) {
        if(this.props.isEdit) {
            var self = this;
            self.addImg_urls.pop();
            var url = $(event.target).attr("data-url");
            $(event.target).parent('dd').remove();
            $('#up_img').prop('disabled', '');
            $('label[for="up_img"][className="upload"]').css('opacity', '1');
        }

    },

    render: function () {
        //<input onClick={this.addImgs} id="up_img" type="file" name="fileName" multiple="multiple"/>

        return (
            <div className="creat_con">
                <form className="creat_form trans02">
                    <div className="f_p form_part1" name="sendMsgForm">
                        <div className="fill_form">
                            <li>
                                <div id="progressbar1"><b className="trans02"></b></div>
                            </li>
                            <li>
                                <img id="tempimg" dynsrc="" src="" style={{display:"none"}}/>
                                <input onClick={this.uploadImgs} id="up_img" type="file" name="content" multiple="multiple"/>
                                <div id="progress">
                                    <div className="bar" style={{width: '0%'}}></div>
                                </div>
                                <dl className="imgList">
                                    {this.renderUploadImg()}
                                </dl>
                                <label htmlFor="up_img" className={"upload "+(this.props.isEdit?"":"hide")}>
                                    <div className="name">上传图片</div>
                                    <div className="ts">(最多6张)</div>
                                    <div className="icon">+</div>
                                </label>

                                <dl className="imgList">
                                    {this.state.imgListView}
                                </dl>

                                <div className="clear"></div>
                            </li>
                        </div>
                    </div>
                </form>
            </div>
        );

    },
});

module.exports = Image;
