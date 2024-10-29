<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">

<!--
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/chartist/0.9.8/chartist.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/chartist/0.9.8/chartist.min.css" />
-->

<?php echo $this->topNavigation(); ?>
<?php
if(get_option('clickky_login')):?>
    <div class="row content col s12 dashboard">
        <h1><?php _e('STATS', 'clickky'); ?></h1>
        <h5><?php _e('REVENUE', 'clickky'); ?></h5>

        <div class="row" id="revenue">
            <div class="col s2">
                <h4><?php _e('TODAY', 'clickky'); ?></h4>
                <div class="inner">
                    <div class="val today">
                        <div class="preloader-wrapper small active">
                            <div class="spinner-layer spinner-green-only">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div><div class="gap-patch">
                                    <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col s2">
                <h4><?php _e('YESTERDAY', 'clickky'); ?></h4>
                <div class="inner">
                    <div class="val yesterday">
                        <div class="preloader-wrapper small active">
                            <div class="spinner-layer spinner-green-only">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div><div class="gap-patch">
                                    <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col s2">
                <h4><?php _e('7 DAYS', 'clickky'); ?></h4>
                <div class="inner">
                    <div class="val seven">
                        <div class="preloader-wrapper small active">
                            <div class="spinner-layer spinner-green-only">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div><div class="gap-patch">
                                    <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col s2">
                <h4><?php _e('THIS MONTH', 'clickky'); ?></h4>
                <div class="inner">
                    <div class="val this_month">
                        <div class="preloader-wrapper small active">
                            <div class="spinner-layer spinner-green-only">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div><div class="gap-patch">
                                    <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col s2">
                <h4><?php _e('LAST MONTH', 'clickky'); ?></h4>
                <div class="inner">
                    <div class="val last_month">
                        <div class="preloader-wrapper small active">
                            <div class="spinner-layer spinner-green-only">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div><div class="gap-patch">
                                    <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col s2">
                <h4><?php _e('ALL TIME', 'clickky'); ?></h4>
                <div class="inner">
                    <div class="val all_time">
                        <div class="preloader-wrapper small active">
                            <div class="spinner-layer spinner-green-only">
                                <div class="circle-clipper left">
                                    <div class="circle"></div>
                                </div><div class="gap-patch">
                                    <div class="circle"></div>
                                </div><div class="circle-clipper right">
                                    <div class="circle"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row devices">
            <div class="col s6">
            </div>
            <div class="col s6 noright">
                <ul class="tabs">
                    <li class="tab col s3"><a href="#test1"><?php _e('Today', 'clickky'); ?></a></li>
                    <li class="tab col s3"><a href="#test2"><?php _e('Yesterday', 'clickky'); ?></a></li>
                    <li class="tab col s3"><a href="#test3"><?php _e('Last 7 days', 'clickky'); ?></a></li>
                    <li class="tab col s3"><a href="#test4"><?php _e('Last 30 days', 'clickky'); ?></a></li>
                    <li class="tab col s3"><a href="#test5"><?php _e('Last 90 days', 'clickky'); ?></a></li>
                </ul>
            </div>
            <div id="test1" class="col s12 noright">
                <div class="col s6">
                    <h2>OS</h2>
                    <div class="ibox">

                        <div class="col s6">
                            <svg width="30" height="35" viewBox="0 0 16 19"
                                 data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1">
                                <path
                                    d="M1.166,6.194H1.118A1.128,1.128,0,0,0,0,7.327v4.929a1.128,1.128,0,0,0,1.117,1.133H1.166a1.128,1.128,0,0,0,1.117-1.133V7.327A1.129,1.129,0,0,0,1.166,6.194Zm1.653,7.963A1.035,1.035,0,0,0,3.846,15.2h1.1v2.662a1.128,1.128,0,0,0,1.118,1.134H6.109a1.129,1.129,0,0,0,1.119-1.134V15.2H8.762v2.662a1.13,1.13,0,0,0,1.119,1.134H9.928a1.129,1.129,0,0,0,1.119-1.134V15.2h1.1a1.035,1.035,0,0,0,1.026-1.039V6.375H2.819v7.782Zm7.754-12.5,0.872-1.363A0.188,0.188,0,0,0,11.39.034a0.182,0.182,0,0,0-.256.055L10.23,1.5a5.9,5.9,0,0,0-4.471,0l-0.9-1.41A0.183,0.183,0,0,0,4.6.034a0.189,0.189,0,0,0-.055.259L5.418,1.656A4.471,4.471,0,0,0,2.784,5.6C2.784,5.7,2.791,5.8,2.8,5.9H13.192c0.008-.1.014-0.2,0.014-0.307A4.471,4.471,0,0,0,10.573,1.656ZM5.586,4.1a0.506,0.506,0,1,1,.5-0.506A0.5,0.5,0,0,1,5.586,4.1Zm4.818,0a0.506,0.506,0,1,1,.5-0.506A0.5,0.5,0,0,1,10.4,4.1Zm4.467,2.1H14.825a1.13,1.13,0,0,0-1.119,1.132v4.929a1.13,1.13,0,0,0,1.119,1.133h0.047a1.128,1.128,0,0,0,1.118-1.133V7.327A1.129,1.129,0,0,0,14.872,6.194Z"
                                ></path>
                            </svg>
                            <div class="inner percent">
                                <div class="val android today">

                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p>Android</p></div>
                        <div class="col s6">
                            <svg width="30" height="35" viewBox="0 0 15 18"
                                 data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1">
                                <path
                                    d="M12.545,10.086c-0.5-2.489,1.908-3.95,1.908-3.95a4.611,4.611,0,0,0-2.521-1.675,4.476,4.476,0,0,0-3.159.408,3.587,3.587,0,0,1-1.184.322c-1.14,0-1.973-1.182-4.145-.644A5.043,5.043,0,0,0,.088,8.627,10.877,10.877,0,0,0,1.6,15.22c1.184,2,2.39,2.75,3.246,2.771s1.711-.6,2.741-0.752,1.666,0.366,2.676.645,1.361,0.02,2.522-.947S15,13.2,15,13.2A4.034,4.034,0,0,1,12.545,10.086ZM10.308,2.85A3.346,3.346,0,0,0,11.047,0,5.409,5.409,0,0,0,8.422,1.347a3.809,3.809,0,0,0-.877,2.77A5,5,0,0,0,10.308,2.85Z"
                                    data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1.1"></path>
                            </svg>
                            <div class="inner percent">
                                <div class="val ios today">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p>IOS</p>
                        </div>
                    </div>

                </div>
                <div class="col s6 type noright">
                    <h2><?php _e('DEVICE TYPE', 'clickky'); ?></h2>
                    <div class="ibox">

                        <div class="col s6">
                            <svg width="45" height="40" viewBox="0 0 28 22" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1"><path d="M28.011,20.265V1.756A1.72,1.72,0,0,0,26.324.01H1.686A1.72,1.72,0,0,0,0,1.756V20.265a1.72,1.72,0,0,0,1.687,1.746H26.324A1.719,1.719,0,0,0,28.011,20.265Zm-0.97-9.254a0.253,0.253,0,1,1-.253-0.262A0.258,0.258,0,0,1,27.041,11.011Zm-26.113,0a0.515,0.515,0,0,1,.506-0.524,0.524,0.524,0,0,1,0,1.048A0.515,0.515,0,0,1,.927,11.011Zm1.561,9.6V1.407H25.522V20.614H2.488Z" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1.0"></path></svg>
                            <div class="inner percent">
                                <div class="val tables today">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p><?php _e('Tablets', 'clickky'); ?></p></div>
                        <div class="col s6">
                            <svg width="25" height="40" viewBox="0 0 13 23" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1"><path d="M11.492,0H1.5A1.538,1.538,0,0,0-.014,1.554V21.446A1.539,1.539,0,0,0,1.5,23h9.992a1.538,1.538,0,0,0,1.514-1.554V1.554A1.538,1.538,0,0,0,11.492,0ZM4.9,1.12h3.2a0.188,0.188,0,0,1,0,.376H4.9A0.188,0.188,0,0,1,4.9,1.12Zm1.6,21.1a0.777,0.777,0,1,1,.757-0.777A0.767,0.767,0,0,1,6.5,22.224Zm5.457-2.1H1.04V2.464H11.953V20.125Z" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1.1"></path></svg>
                            <div class="inner percent">
                                <div class="val phones today">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p><?php _e('Phones', 'clickky'); ?></p>
                        </div>
                    </div>
                </div>

            </div>
            <div id="test2" class="col s12 noright">
                <div class="col s6">
                    <h2>OS</h2>
                    <div class="ibox">

                        <div class="col s6">
                            <svg width="30" height="35" viewBox="0 0 16 19"
                                 data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1">
                                <path
                                    d="M1.166,6.194H1.118A1.128,1.128,0,0,0,0,7.327v4.929a1.128,1.128,0,0,0,1.117,1.133H1.166a1.128,1.128,0,0,0,1.117-1.133V7.327A1.129,1.129,0,0,0,1.166,6.194Zm1.653,7.963A1.035,1.035,0,0,0,3.846,15.2h1.1v2.662a1.128,1.128,0,0,0,1.118,1.134H6.109a1.129,1.129,0,0,0,1.119-1.134V15.2H8.762v2.662a1.13,1.13,0,0,0,1.119,1.134H9.928a1.129,1.129,0,0,0,1.119-1.134V15.2h1.1a1.035,1.035,0,0,0,1.026-1.039V6.375H2.819v7.782Zm7.754-12.5,0.872-1.363A0.188,0.188,0,0,0,11.39.034a0.182,0.182,0,0,0-.256.055L10.23,1.5a5.9,5.9,0,0,0-4.471,0l-0.9-1.41A0.183,0.183,0,0,0,4.6.034a0.189,0.189,0,0,0-.055.259L5.418,1.656A4.471,4.471,0,0,0,2.784,5.6C2.784,5.7,2.791,5.8,2.8,5.9H13.192c0.008-.1.014-0.2,0.014-0.307A4.471,4.471,0,0,0,10.573,1.656ZM5.586,4.1a0.506,0.506,0,1,1,.5-0.506A0.5,0.5,0,0,1,5.586,4.1Zm4.818,0a0.506,0.506,0,1,1,.5-0.506A0.5,0.5,0,0,1,10.4,4.1Zm4.467,2.1H14.825a1.13,1.13,0,0,0-1.119,1.132v4.929a1.13,1.13,0,0,0,1.119,1.133h0.047a1.128,1.128,0,0,0,1.118-1.133V7.327A1.129,1.129,0,0,0,14.872,6.194Z"
                                ></path>
                            </svg>
                            <div class="inner percent">
                                <div class="val android yesterday">

                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p>Android</p></div>
                        <div class="col s6">
                            <svg width="30" height="35" viewBox="0 0 15 18"
                                 data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1">
                                <path
                                    d="M12.545,10.086c-0.5-2.489,1.908-3.95,1.908-3.95a4.611,4.611,0,0,0-2.521-1.675,4.476,4.476,0,0,0-3.159.408,3.587,3.587,0,0,1-1.184.322c-1.14,0-1.973-1.182-4.145-.644A5.043,5.043,0,0,0,.088,8.627,10.877,10.877,0,0,0,1.6,15.22c1.184,2,2.39,2.75,3.246,2.771s1.711-.6,2.741-0.752,1.666,0.366,2.676.645,1.361,0.02,2.522-.947S15,13.2,15,13.2A4.034,4.034,0,0,1,12.545,10.086ZM10.308,2.85A3.346,3.346,0,0,0,11.047,0,5.409,5.409,0,0,0,8.422,1.347a3.809,3.809,0,0,0-.877,2.77A5,5,0,0,0,10.308,2.85Z"
                                    data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1.1"></path>
                            </svg>
                            <div class="inner percent">
                                <div class="val ios yesterday">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p>IOS</p>
                        </div>
                    </div>

                </div>
                <div class="col s6 type noright">
                    <h2><?php _e('DEVICE TYPE', 'clickky'); ?></h2>
                    <div class="ibox">

                        <div class="col s6">
                            <svg width="45" height="40" viewBox="0 0 28 22" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1"><path d="M28.011,20.265V1.756A1.72,1.72,0,0,0,26.324.01H1.686A1.72,1.72,0,0,0,0,1.756V20.265a1.72,1.72,0,0,0,1.687,1.746H26.324A1.719,1.719,0,0,0,28.011,20.265Zm-0.97-9.254a0.253,0.253,0,1,1-.253-0.262A0.258,0.258,0,0,1,27.041,11.011Zm-26.113,0a0.515,0.515,0,0,1,.506-0.524,0.524,0.524,0,0,1,0,1.048A0.515,0.515,0,0,1,.927,11.011Zm1.561,9.6V1.407H25.522V20.614H2.488Z" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1.0"></path></svg>
                            <div class="inner percent">
                                <div class="val tables yesterday">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p><?php _e('Tablets', 'clickky'); ?></p></div>
                        <div class="col s6">
                            <svg width="25" height="40" viewBox="0 0 13 23" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1"><path d="M11.492,0H1.5A1.538,1.538,0,0,0-.014,1.554V21.446A1.539,1.539,0,0,0,1.5,23h9.992a1.538,1.538,0,0,0,1.514-1.554V1.554A1.538,1.538,0,0,0,11.492,0ZM4.9,1.12h3.2a0.188,0.188,0,0,1,0,.376H4.9A0.188,0.188,0,0,1,4.9,1.12Zm1.6,21.1a0.777,0.777,0,1,1,.757-0.777A0.767,0.767,0,0,1,6.5,22.224Zm5.457-2.1H1.04V2.464H11.953V20.125Z" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1.1"></path></svg>
                            <div class="inner percent">
                                <div class="val phones yesterday">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p><?php _e('Phones', 'clickky'); ?></p>
                        </div>
                    </div>
                </div>
            </div>
            <div id="test3" class="col s12 noright">
                <div class="col s6">
                    <h2>OS</h2>
                    <div class="ibox">

                        <div class="col s6">
                            <svg width="30" height="35" viewBox="0 0 16 19"
                                 data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1">
                                <path
                                    d="M1.166,6.194H1.118A1.128,1.128,0,0,0,0,7.327v4.929a1.128,1.128,0,0,0,1.117,1.133H1.166a1.128,1.128,0,0,0,1.117-1.133V7.327A1.129,1.129,0,0,0,1.166,6.194Zm1.653,7.963A1.035,1.035,0,0,0,3.846,15.2h1.1v2.662a1.128,1.128,0,0,0,1.118,1.134H6.109a1.129,1.129,0,0,0,1.119-1.134V15.2H8.762v2.662a1.13,1.13,0,0,0,1.119,1.134H9.928a1.129,1.129,0,0,0,1.119-1.134V15.2h1.1a1.035,1.035,0,0,0,1.026-1.039V6.375H2.819v7.782Zm7.754-12.5,0.872-1.363A0.188,0.188,0,0,0,11.39.034a0.182,0.182,0,0,0-.256.055L10.23,1.5a5.9,5.9,0,0,0-4.471,0l-0.9-1.41A0.183,0.183,0,0,0,4.6.034a0.189,0.189,0,0,0-.055.259L5.418,1.656A4.471,4.471,0,0,0,2.784,5.6C2.784,5.7,2.791,5.8,2.8,5.9H13.192c0.008-.1.014-0.2,0.014-0.307A4.471,4.471,0,0,0,10.573,1.656ZM5.586,4.1a0.506,0.506,0,1,1,.5-0.506A0.5,0.5,0,0,1,5.586,4.1Zm4.818,0a0.506,0.506,0,1,1,.5-0.506A0.5,0.5,0,0,1,10.4,4.1Zm4.467,2.1H14.825a1.13,1.13,0,0,0-1.119,1.132v4.929a1.13,1.13,0,0,0,1.119,1.133h0.047a1.128,1.128,0,0,0,1.118-1.133V7.327A1.129,1.129,0,0,0,14.872,6.194Z"
                                ></path>
                            </svg>
                            <div class="inner percent">
                                <div class="val android seven">

                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p>Android</p></div>
                        <div class="col s6">
                            <svg width="30" height="35" viewBox="0 0 15 18"
                                 data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1">
                                <path
                                    d="M12.545,10.086c-0.5-2.489,1.908-3.95,1.908-3.95a4.611,4.611,0,0,0-2.521-1.675,4.476,4.476,0,0,0-3.159.408,3.587,3.587,0,0,1-1.184.322c-1.14,0-1.973-1.182-4.145-.644A5.043,5.043,0,0,0,.088,8.627,10.877,10.877,0,0,0,1.6,15.22c1.184,2,2.39,2.75,3.246,2.771s1.711-.6,2.741-0.752,1.666,0.366,2.676.645,1.361,0.02,2.522-.947S15,13.2,15,13.2A4.034,4.034,0,0,1,12.545,10.086ZM10.308,2.85A3.346,3.346,0,0,0,11.047,0,5.409,5.409,0,0,0,8.422,1.347a3.809,3.809,0,0,0-.877,2.77A5,5,0,0,0,10.308,2.85Z"
                                    data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1.1"></path>
                            </svg>
                            <div class="inner percent">
                                <div class="val ios seven">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p>IOS</p>
                        </div>
                    </div>

                </div>
                <div class="col s6 type noright">
                    <h2><?php _e('DEVICE TYPE', 'clickky'); ?></h2>
                    <div class="ibox">

                        <div class="col s6">
                            <svg width="45" height="40" viewBox="0 0 28 22" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1"><path d="M28.011,20.265V1.756A1.72,1.72,0,0,0,26.324.01H1.686A1.72,1.72,0,0,0,0,1.756V20.265a1.72,1.72,0,0,0,1.687,1.746H26.324A1.719,1.719,0,0,0,28.011,20.265Zm-0.97-9.254a0.253,0.253,0,1,1-.253-0.262A0.258,0.258,0,0,1,27.041,11.011Zm-26.113,0a0.515,0.515,0,0,1,.506-0.524,0.524,0.524,0,0,1,0,1.048A0.515,0.515,0,0,1,.927,11.011Zm1.561,9.6V1.407H25.522V20.614H2.488Z" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1.0"></path></svg>
                            <div class="inner percent">
                                <div class="val tables seven">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p><?php _e('Tablets', 'clickky'); ?></p></div>
                        <div class="col s6">
                            <svg width="25" height="40" viewBox="0 0 13 23" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1"><path d="M11.492,0H1.5A1.538,1.538,0,0,0-.014,1.554V21.446A1.539,1.539,0,0,0,1.5,23h9.992a1.538,1.538,0,0,0,1.514-1.554V1.554A1.538,1.538,0,0,0,11.492,0ZM4.9,1.12h3.2a0.188,0.188,0,0,1,0,.376H4.9A0.188,0.188,0,0,1,4.9,1.12Zm1.6,21.1a0.777,0.777,0,1,1,.757-0.777A0.767,0.767,0,0,1,6.5,22.224Zm5.457-2.1H1.04V2.464H11.953V20.125Z" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1.1"></path></svg>
                            <div class="inner percent">
                                <div class="val phones seven">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p><?php _e('Phones', 'clickky'); ?></p>
                        </div>
                    </div>
                </div>

            </div>
            <div id="test4" class="col s12 noright">

                <div class="col s6">
                    <h2>OS</h2>
                    <div class="ibox">

                        <div class="col s6">
                            <svg width="30" height="35" viewBox="0 0 16 19"
                                 data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1">
                                <path
                                    d="M1.166,6.194H1.118A1.128,1.128,0,0,0,0,7.327v4.929a1.128,1.128,0,0,0,1.117,1.133H1.166a1.128,1.128,0,0,0,1.117-1.133V7.327A1.129,1.129,0,0,0,1.166,6.194Zm1.653,7.963A1.035,1.035,0,0,0,3.846,15.2h1.1v2.662a1.128,1.128,0,0,0,1.118,1.134H6.109a1.129,1.129,0,0,0,1.119-1.134V15.2H8.762v2.662a1.13,1.13,0,0,0,1.119,1.134H9.928a1.129,1.129,0,0,0,1.119-1.134V15.2h1.1a1.035,1.035,0,0,0,1.026-1.039V6.375H2.819v7.782Zm7.754-12.5,0.872-1.363A0.188,0.188,0,0,0,11.39.034a0.182,0.182,0,0,0-.256.055L10.23,1.5a5.9,5.9,0,0,0-4.471,0l-0.9-1.41A0.183,0.183,0,0,0,4.6.034a0.189,0.189,0,0,0-.055.259L5.418,1.656A4.471,4.471,0,0,0,2.784,5.6C2.784,5.7,2.791,5.8,2.8,5.9H13.192c0.008-.1.014-0.2,0.014-0.307A4.471,4.471,0,0,0,10.573,1.656ZM5.586,4.1a0.506,0.506,0,1,1,.5-0.506A0.5,0.5,0,0,1,5.586,4.1Zm4.818,0a0.506,0.506,0,1,1,.5-0.506A0.5,0.5,0,0,1,10.4,4.1Zm4.467,2.1H14.825a1.13,1.13,0,0,0-1.119,1.132v4.929a1.13,1.13,0,0,0,1.119,1.133h0.047a1.128,1.128,0,0,0,1.118-1.133V7.327A1.129,1.129,0,0,0,14.872,6.194Z"
                                ></path>
                            </svg>
                            <div class="inner percent">
                                <div class="val android this_month">

                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p>Android</p></div>
                        <div class="col s6">
                            <svg width="30" height="35" viewBox="0 0 15 18"
                                 data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1">
                                <path
                                    d="M12.545,10.086c-0.5-2.489,1.908-3.95,1.908-3.95a4.611,4.611,0,0,0-2.521-1.675,4.476,4.476,0,0,0-3.159.408,3.587,3.587,0,0,1-1.184.322c-1.14,0-1.973-1.182-4.145-.644A5.043,5.043,0,0,0,.088,8.627,10.877,10.877,0,0,0,1.6,15.22c1.184,2,2.39,2.75,3.246,2.771s1.711-.6,2.741-0.752,1.666,0.366,2.676.645,1.361,0.02,2.522-.947S15,13.2,15,13.2A4.034,4.034,0,0,1,12.545,10.086ZM10.308,2.85A3.346,3.346,0,0,0,11.047,0,5.409,5.409,0,0,0,8.422,1.347a3.809,3.809,0,0,0-.877,2.77A5,5,0,0,0,10.308,2.85Z"
                                    data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1.1"></path>
                            </svg>
                            <div class="inner percent">
                                <div class="val ios this_month">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p>IOS</p>
                        </div>
                    </div>

                </div>
                <div class="col s6 type noright">
                    <h2><?php _e('DEVICE TYPE', 'clickky'); ?></h2>
                    <div class="ibox">

                        <div class="col s6">
                            <svg width="45" height="40" viewBox="0 0 28 22" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1"><path d="M28.011,20.265V1.756A1.72,1.72,0,0,0,26.324.01H1.686A1.72,1.72,0,0,0,0,1.756V20.265a1.72,1.72,0,0,0,1.687,1.746H26.324A1.719,1.719,0,0,0,28.011,20.265Zm-0.97-9.254a0.253,0.253,0,1,1-.253-0.262A0.258,0.258,0,0,1,27.041,11.011Zm-26.113,0a0.515,0.515,0,0,1,.506-0.524,0.524,0.524,0,0,1,0,1.048A0.515,0.515,0,0,1,.927,11.011Zm1.561,9.6V1.407H25.522V20.614H2.488Z" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1.0"></path></svg>
                            <div class="inner percent">
                                <div class="val tables this_month">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p><?php _e('Tablets', 'clickky'); ?></p></div>
                        <div class="col s6">
                            <svg width="25" height="40" viewBox="0 0 13 23" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1"><path d="M11.492,0H1.5A1.538,1.538,0,0,0-.014,1.554V21.446A1.539,1.539,0,0,0,1.5,23h9.992a1.538,1.538,0,0,0,1.514-1.554V1.554A1.538,1.538,0,0,0,11.492,0ZM4.9,1.12h3.2a0.188,0.188,0,0,1,0,.376H4.9A0.188,0.188,0,0,1,4.9,1.12Zm1.6,21.1a0.777,0.777,0,1,1,.757-0.777A0.767,0.767,0,0,1,6.5,22.224Zm5.457-2.1H1.04V2.464H11.953V20.125Z" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1.1"></path></svg>
                            <div class="inner percent">
                                <div class="val phones this_month">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p><?php _e('Phones', 'clickky'); ?></p>
                        </div>
                    </div>
                </div>

            </div>
            <div id="test5" class="col s12 noright">
                <div class="col s6">
                    <h2>OS</h2>
                    <div class="ibox">

                        <div class="col s6">
                            <svg width="30" height="35" viewBox="0 0 16 19"
                                 data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1">
                                <path
                                    d="M1.166,6.194H1.118A1.128,1.128,0,0,0,0,7.327v4.929a1.128,1.128,0,0,0,1.117,1.133H1.166a1.128,1.128,0,0,0,1.117-1.133V7.327A1.129,1.129,0,0,0,1.166,6.194Zm1.653,7.963A1.035,1.035,0,0,0,3.846,15.2h1.1v2.662a1.128,1.128,0,0,0,1.118,1.134H6.109a1.129,1.129,0,0,0,1.119-1.134V15.2H8.762v2.662a1.13,1.13,0,0,0,1.119,1.134H9.928a1.129,1.129,0,0,0,1.119-1.134V15.2h1.1a1.035,1.035,0,0,0,1.026-1.039V6.375H2.819v7.782Zm7.754-12.5,0.872-1.363A0.188,0.188,0,0,0,11.39.034a0.182,0.182,0,0,0-.256.055L10.23,1.5a5.9,5.9,0,0,0-4.471,0l-0.9-1.41A0.183,0.183,0,0,0,4.6.034a0.189,0.189,0,0,0-.055.259L5.418,1.656A4.471,4.471,0,0,0,2.784,5.6C2.784,5.7,2.791,5.8,2.8,5.9H13.192c0.008-.1.014-0.2,0.014-0.307A4.471,4.471,0,0,0,10.573,1.656ZM5.586,4.1a0.506,0.506,0,1,1,.5-0.506A0.5,0.5,0,0,1,5.586,4.1Zm4.818,0a0.506,0.506,0,1,1,.5-0.506A0.5,0.5,0,0,1,10.4,4.1Zm4.467,2.1H14.825a1.13,1.13,0,0,0-1.119,1.132v4.929a1.13,1.13,0,0,0,1.119,1.133h0.047a1.128,1.128,0,0,0,1.118-1.133V7.327A1.129,1.129,0,0,0,14.872,6.194Z"
                                ></path>
                            </svg>
                            <div class="inner percent">
                                <div class="val android three_month">

                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p>Android</p></div>
                        <div class="col s6">
                            <svg width="30" height="35" viewBox="0 0 15 18"
                                 data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1">
                                <path
                                    d="M12.545,10.086c-0.5-2.489,1.908-3.95,1.908-3.95a4.611,4.611,0,0,0-2.521-1.675,4.476,4.476,0,0,0-3.159.408,3.587,3.587,0,0,1-1.184.322c-1.14,0-1.973-1.182-4.145-.644A5.043,5.043,0,0,0,.088,8.627,10.877,10.877,0,0,0,1.6,15.22c1.184,2,2.39,2.75,3.246,2.771s1.711-.6,2.741-0.752,1.666,0.366,2.676.645,1.361,0.02,2.522-.947S15,13.2,15,13.2A4.034,4.034,0,0,1,12.545,10.086ZM10.308,2.85A3.346,3.346,0,0,0,11.047,0,5.409,5.409,0,0,0,8.422,1.347a3.809,3.809,0,0,0-.877,2.77A5,5,0,0,0,10.308,2.85Z"
                                    data-reactid=".0.0.1.0.1.2.1.0.1.0.1.1.1.1"></path>
                            </svg>
                            <div class="inner percent">
                                <div class="val ios three_month">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p>IOS</p>
                        </div>
                    </div>

                </div>
                <div class="col s6 type noright">
                    <h2><?php _e('DEVICE TYPE', 'clickky'); ?></h2>
                    <div class="ibox">

                        <div class="col s6">
                            <svg width="45" height="40" viewBox="0 0 28 22" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1"><path d="M28.011,20.265V1.756A1.72,1.72,0,0,0,26.324.01H1.686A1.72,1.72,0,0,0,0,1.756V20.265a1.72,1.72,0,0,0,1.687,1.746H26.324A1.719,1.719,0,0,0,28.011,20.265Zm-0.97-9.254a0.253,0.253,0,1,1-.253-0.262A0.258,0.258,0,0,1,27.041,11.011Zm-26.113,0a0.515,0.515,0,0,1,.506-0.524,0.524,0.524,0,0,1,0,1.048A0.515,0.515,0,0,1,.927,11.011Zm1.561,9.6V1.407H25.522V20.614H2.488Z" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1.0"></path></svg>
                            <div class="inner percent">
                                <div class="val tables three_month">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p><?php _e('Tablets', 'clickky'); ?></p></div>
                        <div class="col s6">
                            <svg width="25" height="40" viewBox="0 0 13 23" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1"><path d="M11.492,0H1.5A1.538,1.538,0,0,0-.014,1.554V21.446A1.539,1.539,0,0,0,1.5,23h9.992a1.538,1.538,0,0,0,1.514-1.554V1.554A1.538,1.538,0,0,0,11.492,0ZM4.9,1.12h3.2a0.188,0.188,0,0,1,0,.376H4.9A0.188,0.188,0,0,1,4.9,1.12Zm1.6,21.1a0.777,0.777,0,1,1,.757-0.777A0.767,0.767,0,0,1,6.5,22.224Zm5.457-2.1H1.04V2.464H11.953V20.125Z" data-reactid=".0.0.1.0.1.2.1.1.1.1.1.1.1.1"></path></svg>
                            <div class="inner percent">
                                <div class="val phones three_month">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <p><?php _e('Phones', 'clickky'); ?></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col s12 noright" style="padding-left: 5px;">
            <hr />
        </div>
        <?php if(count($result)>0): ?>
        <div class="col s12 noright my_placement main_placement">
            <div class="col s12 noright" style="margin-top: 20px;">
                 <div class="col s9 noright"></div>
                 <div class="col s2 noright">
                    <input type="text"
                       data-range="true"
                       data-multiple-dates-separator=" - "
                       data-language="en"
                       placeholder="<?php

                       function ruMonthsToEn($date){
                           $ruMonths = array( 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь' );
                           $enMonths = array( 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' );
                           if(get_locale() == 'ru_RU'){
                               return str_replace($enMonths, $ruMonths, $date);
                           }
                           return $date;
                       }
                       echo ruMonthsToEn(strftime('%d %B %Y'));

                       ?>"
                       class="datepicker-here"/>
                     <input type="hidden" name="date" value="<?php echo date('Y-m-d'); ?>" id="datepicker"/>
                 </div>
                <div class="col s1 noright calendar_icon" >
                    <i class="fa fa-calendar  fa-2x" aria-hidden="true"></i>
                </div>
            </div>
                <table class="ads_list">
                    <thead>
                    <tr class="hd">
                        <th data-field="id"></th>
                        <th data-field="id"><?php _e('Status', 'clickky'); ?></th>
                        <th data-field="name"><?php _e('Requests', 'clickky'); ?></th>
                        <th data-field="price"><?php _e('Response', 'clickky'); ?></th>
                        <th data-field="price"><?php _e('Impressions', 'clickky'); ?></th>
                        <th data-field="price"><?php _e('Clicks', 'clickky'); ?></th>
                        <th data-field="price"><?php _e('Ctr,%', 'clickky'); ?></th>
                        <th data-field="price"><?php _e('Revenue,$', 'clickky'); ?></th>
                        <th data-field="price"><?php _e('Ecpm,$', 'clickky'); ?></th>
                        <th data-field="price"><?php _e('Fillrate,%', 'clickky'); ?></th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($result as $k => $item):  ?>
                            <tr data-id="<?php if($item['result']['site_id']!='') echo $item['result']['site_id']; else echo $item['result']['widget_id']; ?>"
                                data-original-id="<?php echo $item['original_id']; ?>"
                                class="ads td_<?php echo $item['original_id']; ?> <?php if ($item['status'] == 0) echo 'unchecked' ?>">
                                <td class="title"><?php
                                        echo $item['name'];
                                    ?></td>
                                <td>
                                    <div class="switch">
                                        <label>
                                            <input type="checkbox"
                                                   data-id="<?php echo $item['original_id']; ?>" <?php if ($item['status'] == 1) echo 'checked' ?>>
                                            <span class="lever"></span>
                                        </label>
                                    </div>

                                </td>
                                <td class="preloa">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="preloa">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="preloa">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="preloa">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="preloa">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="preloa">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="preloa">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="preloa">
                                    <div class="preloader-wrapper small active">
                                        <div class="spinner-layer spinner-green-only">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div><div class="gap-patch">
                                                <div class="circle"></div>
                                            </div><div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                    <?php endforeach; ?>
                    </tbody>
                    <tfoot class="all_foot">
                        <tr class="hd">
                            <th class="title"><?php _e('Total', 'clickky'); ?></th>
                            <th class="all_foot">
                            </th>
                            <th class="all_requests preloa">
                                <div class="preloader-wrapper small active">
                                    <div class="spinner-layer spinner-green-only">
                                        <div class="circle-clipper left">
                                            <div class="circle"></div>
                                        </div><div class="gap-patch">
                                            <div class="circle"></div>
                                        </div><div class="circle-clipper right">
                                            <div class="circle"></div>
                                        </div>
                                    </div>
                                </div>
                            </th>
                            <th class="all_responses preloa">
                                <div class="preloader-wrapper small active">
                                    <div class="spinner-layer spinner-green-only">
                                        <div class="circle-clipper left">
                                            <div class="circle"></div>
                                        </div><div class="gap-patch">
                                            <div class="circle"></div>
                                        </div><div class="circle-clipper right">
                                            <div class="circle"></div>
                                        </div>
                                    </div>
                                </div>
                            </th>
                            <th class="all_impressions preloa">
                                <div class="preloader-wrapper small active">
                                    <div class="spinner-layer spinner-green-only">
                                        <div class="circle-clipper left">
                                            <div class="circle"></div>
                                        </div><div class="gap-patch">
                                            <div class="circle"></div>
                                        </div><div class="circle-clipper right">
                                            <div class="circle"></div>
                                        </div>
                                    </div>
                                </div>
                            </th>
                            <th class="all_clicks preloa">
                                <div class="preloader-wrapper small active">
                                    <div class="spinner-layer spinner-green-only">
                                        <div class="circle-clipper left">
                                            <div class="circle"></div>
                                        </div><div class="gap-patch">
                                            <div class="circle"></div>
                                        </div><div class="circle-clipper right">
                                            <div class="circle"></div>
                                        </div>
                                    </div>
                                </div>
                            </th>
                            <th class="all_ctr preloa">
                                <div class="preloader-wrapper small active">
                                    <div class="spinner-layer spinner-green-only">
                                        <div class="circle-clipper left">
                                            <div class="circle"></div>
                                        </div><div class="gap-patch">
                                            <div class="circle"></div>
                                        </div><div class="circle-clipper right">
                                            <div class="circle"></div>
                                        </div>
                                    </div>
                                </div>
                            </th>
                            <th class="all_payout preloa">
                                <div class="preloader-wrapper small active">
                                    <div class="spinner-layer spinner-green-only">
                                        <div class="circle-clipper left">
                                            <div class="circle"></div>
                                        </div><div class="gap-patch">
                                            <div class="circle"></div>
                                        </div><div class="circle-clipper right">
                                            <div class="circle"></div>
                                        </div>
                                    </div>
                                </div>
                            </th>
                            <th class="all_ecpm preloa">
                                <div class="preloader-wrapper small active">
                                    <div class="spinner-layer spinner-green-only">
                                        <div class="circle-clipper left">
                                            <div class="circle"></div>
                                        </div><div class="gap-patch">
                                            <div class="circle"></div>
                                        </div><div class="circle-clipper right">
                                            <div class="circle"></div>
                                        </div>
                                    </div>
                                </div>
                            </th>
                            <th class="all_fillrate_overall preloa">
                                <div class="preloader-wrapper small active">
                                    <div class="spinner-layer spinner-green-only">
                                        <div class="circle-clipper left">
                                            <div class="circle"></div>
                                        </div><div class="gap-patch">
                                            <div class="circle"></div>
                                        </div><div class="circle-clipper right">
                                            <div class="circle"></div>
                                        </div>
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </tfoot>
                </table>
        </div>
        <?php endif; ?>
    </div>
    <button data-target="modal1" id="modal_click" style="display: none;"></button>
<?php else: ?>
    <div class="row content col s12 login">
        <?php if(isset($message)):?>
            <div class="row">
                <div class="col s12">
                    <div class="card-panel red darken-2">
                        <span class="white-text"><?php echo $message; ?></span>
                    </div>
                </div>
            </div>
        <?php endif; ?>
        <div class="AuthLayout__login-window___3l3CF">
            <div>
                <div class="LoginPage clearfix">

                    <div class="LoginView__login-form___1T-7j">
                        <form action="admin.php?page=clickky" method="post">
                            <div class="LoginView__login-form-username___f3sUS">
                                <div id="login-input" class="style__freak-input___2IIQU FreakInput">
                                    <input type="email" name="username" placeholder="EMAIL" required>
                                </div>
                            </div>
                            <div class="LoginView__login-form-password___1jNNn">
                                <div class="style__freak-input___2IIQU FreakInput">
                                    <input type="password" name="password" placeholder="<?php _e('PASSWORD', 'clickky'); ?>" required>
                                </div>
                            </div>
                            <div class="LoginView__login-submit-wrap___1arP5">
                                <button id="login-button" class="LoginView__login-button___12Lqb">
                                    <?php _e('SIGN IN', 'clickky'); ?>
                                </button>
                            </div>
                        </form>
                        <div class="LoginView__login-forgot___YXFvM" >
                            <a class="LoginView__login-forgot-link___2o4Nq" target="_blank" id="forgot-link" href="http://platform.clickky.biz/recovery">
                                <?php _e('Forgot Password?', 'clickky'); ?>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

<?php endif; ?>