<?php

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Clickky
 * @subpackage Clickky/public
 * @author     Your Name <email@example.com>
 */
class Clickky_Public
{

    /**
     * The ID of this plugin.
     *
     * @since      1.3.6
     * @access   private
     * @var      string $clickky The ID of this plugin.
     */
    private $clickky;

    /**
     * The version of this plugin.
     *
     * @since      1.3.6
     * @access   private
     * @var      string $version The current version of this plugin.
     */
    private $version;

    /**
     * private
     * @var bool Alredy has js recommended ads
     */
    private $show = false;

    /**
     * Initialize the class and set its properties.
     *
     * @since      1.3.6
     * @param      string $clickky The name of the plugin.
     * @param      string $version The version of this plugin.
     */
    public function __construct($clickky, $version)
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . "clickky_ads";
        $this->plugin_name = $clickky;
        $this->version = $version;
        //$this->settings = unserialize(get_option($this->plugin_name . '-settings'));

        $this->recommendeds = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " WHERE name='Native Apps' AND status=1");


    }

    /**
     * Register the stylesheets for the public-facing side of the site.
     *
     * @since      1.3.6
     */
    public function enqueue_banner()
    {

        /**
         * This function is provided for demonstration purposes only.
         *
         * An instance of this class should be passed to the run() function
         * defined in Clickky_Loader as all of the hooks are defined
         * in that particular class.
         *
         * The Clickky_Loader will then create the relationship
         * between the defined hooks and the functions defined in this
         * class.
         */

        echo $this->get_banner();
        echo $this->get_banner_slider();
        echo $this->get_dialog();
        echo $this->get_expandable();
        echo $this->get_fullScreen();
        echo $this->get_interstitial();
        echo $this->get_richmedia();
        echo $this->get_giftedads();
        echo $this->get_intextads();

    }

    /**
     * Set banner to start loop
     * @param $data
     * @return bool
     */
    public function enqueue_recommend_banner_loop_start($data)
    {
        if (!isset($data->query["cat"])) {
            return false;
        }
        if (count($this->recommendeds) > 0) {
            foreach ($this->recommendeds as $result) {
                $ad = unserialize($result->data);
                $settings = unserialize($result->settings);

                if (is_category() && $result->status == 1) {

                    if ($settings['category'] == 'before_loop') {

                        echo $this->get_recommend($ad);
                    }
                }

            }
        }


    }

    /**
     * Set banner to end loop
     * @param $data
     * @return bool
     */
    public function enqueue_recommend_banner_loop_end($data)
    {

        if (!isset($data->query["cat"])) {
            return false;
        }
        if (count($this->recommendeds) > 0) {
            foreach ($this->recommendeds as $result) {
                $ad = unserialize($result->data);
                $settings = unserialize($result->settings);

                if (is_category() && $result->status == 1) {

                    if ($settings['category'] == 'after_loop') {
                        echo $this->get_recommend($ad);
                    }
                }

            }
        }


    }


    /**
     * Set banner after comment
     */
    public function enqueue_recommend_banner_comment_after()
    {
        if (count($this->recommendeds) > 0) {
            foreach ($this->recommendeds as $result) {
                $data = unserialize($result->data);
                $settings = unserialize($result->settings);

                if (is_page() && $result->status == 1) {

                    if ($settings['page'] == 'after_comment') {
                        echo $this->get_recommend($data);
                    }
                }

                if (is_single() && $result->status == 1) {


                    if ($settings['post'] == 'after_comment') {
                        echo $this->get_recommend($data);
                    }

                }

            }
        }

    }

    /**
     * Set banner before comment
     */
    public function enqueue_recommend_banner_comment_before()
    {
        if (count($this->recommendeds) > 0) {
            foreach ($this->recommendeds as $result) {
                $data = unserialize($result->data);
                $settings = unserialize($result->settings);

                if (is_page() && $result->status == 1) {

                    if ($settings['page'] == 'before_comment') {
                        echo $this->get_recommend($data);
                    }
                }

                if (is_single() && $result->status == 1) {

                    if ($settings['post'] == 'before_comment') {
                        echo $this->get_recommend($data);
                    }

                }

            }
        }

    }

    /**
     * Set banner before and after content
     * @param $content
     * @return string
     */
    public function enqueue_recommend_banner_content($content)
    {

        if (count($this->recommendeds) > 0) {

            foreach ($this->recommendeds as $result) {
                $data = unserialize($result->data);
                $settings = unserialize($result->settings);

                if (is_page() && $result->status == 1) {

                    if ($settings['page'] == 'after_content') {
                        return $content . $this->get_recommend($data);
                    } elseif ($settings['page'] == 'before_content') {
                        return $this->get_recommend($data) . $content;
                    } else {
                        return $content;
                    }

                }

                if (is_single() && $result->status == 1) {


                    if ($settings['post'] == 'after_content') {
                        return $content . $this->get_recommend($data);
                    } elseif ($settings['post'] == 'before_content') {
                        return $this->get_recommend($data) . $content;
                    } else {
                        return $content;
                    }
                }


            }
        }
        return $content;
    }

    /**
     * Generate js code Catfish Ads
     * @return string
     */
    public function get_banner()
    {

        $results = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " WHERE name='Catfish Ads' AND status=1");
        if (count($results) > 0) {
            foreach ($results as $result) {
                $data = unserialize($result->data);
                $settings = unserialize($result->settings);
                unset($settings['ads']);
                unset($settings['js_file']);

                if ($this->check_where_show($settings) && $result->status == 1) {
                    return "
                <!-- BEGIN CODE {literal} -->
                <script src='//native.cli.bz/nativeads/banner/js/main.js'></script>
                <script type='text/javascript'>
               
                    var o = {
                        'widget_id' : '" . $data['widget_id'] . "', 
                        'hash': '" . $data['hash'] . "', 
                        'delay' : " . $data['delay'] . ",
                        'template': " . $data['template'] . ",
                        'countBanners': " . $data['countBanners'] . ",
                        'wp': 'true'
                    };
                    var Cliky = new Cliky(o);
                    Cliky.init();
              
                </script>
                <!-- {/literal} END CODE -->
            ";
                }
            }
        }

    }

    /**
     * Generate js code Catfish Ads Slider
     * @return string
     */
    public function get_banner_slider()
    {
        $results = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " WHERE name='Catfish Ads Slider' AND status=1");
        if (count($results) > 0) {
            foreach ($results as $result) {
                $data = unserialize($result->data);
                $settings = unserialize($result->settings);
                unset($settings['ads']);

                unset($settings['js_file']);
                if ($this->check_where_show($settings) && $result->status == 1) {
                    return "
                        <!-- BEGIN CODE {literal} -->
                        <script src='//native.cli.bz/nativeads/banner/js/main.js'></script>
                        <script type='text/javascript'>
                       
                            var o = {
                                'widget_id' : '" . $data['widget_id'] . "', 
                                'hash': '" . $data['hash'] . "', 
                                'delay' : " . $data['delay'] . ",
                                'template': " . $data['template'] . ",
                                'countBanners': " . $data['countBanners'] . ",
                                'wp': 'true'
                            };
                            var Cliky = new Cliky(o);
                            Cliky.init();
                   
                        </script>
                        <!-- {/literal} END CODE -->
                    ";
                }
            }
        }
    }

    /**
     * Generate js code Dialog
     * @return string
     */
    public function get_dialog()
    {
        $results = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " WHERE name='Dialog Ads' AND status=1");
        if (count($results) > 0) {
            foreach ($results as $result) {
                $data = unserialize($result->data);
                $settings = unserialize($result->settings);
                unset($settings['ads']);
                unset($settings['js_file']);
                if ($this->check_where_show($settings) && $result->status == 1) {
                    return "
                <!-- BEGIN CODE {literal} -->
                <script src='//native.cli.bz/nativeads/dialogads/js/main.js'></script>
                <script type='text/javascript'>
                  
                    var o = {
                        'widget_id' : '" . $data['widget_id'] . "', 
                        'hash': '" . $data['hash'] . "', 
                        'delay' : " . $data['delay'] . ",
                        'template': " . $data['template'] . ",
                        'countShow': " . $data['countShow'] . ",
                        'wp': 'true'
                    };
                    var Cliky = new Cliky(o);
                    Cliky.init();
               
                </script>
                <!-- {/literal} END CODE -->
            ";
                }
            }
        }
    }

    /**
     * Generate js code Expandable Banner
     * @return string
     */
    public function get_expandable()
    {
        $results = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " WHERE name='Expandable Banner' AND status=1");
        if (count($results) > 0) {
            foreach ($results as $result) {
                $data = unserialize($result->data);
                $settings = unserialize($result->settings);
                unset($settings['ads']);
                unset($settings['js_file']);
                if ($this->check_where_show($settings) && $result->status == 1) {
                    return "
            <!-- BEGIN CODE {literal} -->
            <script src='//native.cli.bz/nativeads/slideads/js/main.js'></script>
            <script type='text/javascript'>
                var o = {
                    'widget_id' : '" . $data['widget_id'] . "', 
                    'hash': '" . $data['hash'] . "', 
                    'template': " . $data['template'] . ",
                    'background': '" . $data['background'] . "',
                    'autoShow': " . $data['autoShow'] . ",
                    'wp': 'true'
                };
                var ClickkyMultiBanner = new ClickkyMultiBanner(o);
                ClickkyMultiBanner.init();
            </script>
            <!-- {/literal} END CODE -->
        ";
                }
            }
        }
    }

    /**
     * Generate js code FullScreen
     * @return string
     */
    public function get_fullScreen()
    {
        $results = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " WHERE name='Full-screen Ads' AND status=1");
        if (count($results) > 0) {
            foreach ($results as $result) {
                $data = unserialize($result->data);
                $settings = unserialize($result->settings);
                unset($settings['ads']);
                unset($settings['js_file']);
                if ($this->check_where_show($settings) && $result->status == 1) {
                    return "
                <!-- BEGIN CODE {literal} -->
                <script src='//native.cli.bz/nativeads/full/js/main.js'></script>
                <script type='text/javascript'>
                    var o = {
                        'widget_id' : '" . $data['widget_id'] . "',
                        'hash': '" . $data['hash'] . "', 
                        'delay' : " . $data['delay'] . ",
                        'pageShow': " . $data['pageShow'] . ",
                        'wp': 'true'
                    };
                    var ClickkyFull = new ClickkyFull(o);
                    ClickkyFull.init();
                </script>
                <!-- {/literal} END CODE -->
        ";
                }
            }
        }
    }

    /**
     * Generate js code Interstitial
     * @return string
     */
    public function get_interstitial()
    {
        $results = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " WHERE name='Interstitial' AND status=1");
        if (count($results) > 0) {
            foreach ($results as $result) {
                $data = unserialize($result->data);
                $settings = unserialize($result->settings);
                unset($settings['ads']);
                unset($settings['js_file']);
                if ($this->check_where_show($settings) && $result->status == 1) {
                    return "
            <!-- BEGIN CODE {literal} -->
            <script src='//native.cli.bz/nativeads/popin/js/main.js'></script>
            <script type='text/javascript'>
                   var o = {
                       'widget_id' : '" . $data['widget_id'] . "', //set up site_id value
                       'hash': '" . $data['hash'] . "', //set up hash value
                       'template':" . $data['template'] . ",
                       'delay' : " . $data['delay'] . ",
                       'pageShow': " . $data['pageShow'] . ",
                        'wp': 'true'
                   };
                   new ClickkyPopin(o).init();
            </script>
            <!-- {/literal} END CODE -->
        ";
                }
            }
        }
    }

    /**
     * Generate js code Richmedia
     * @return string
     */
    public function get_richmedia()
    {
        $results = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " WHERE name='Rich media' AND status=1");
        if (count($results) > 0) {
            foreach ($results as $result) {
                $data = unserialize($result->data);
                $settings = unserialize($result->settings);
                unset($settings['ads']);
                unset($settings['js_file']);
                if ($this->check_where_show($settings) && $result->status == 1) {
                    return "
            <!-- BEGIN CODE {literal} -->
            <script src='//native.cli.bz/nativeads/media/js/main.js'></script>
            <script type='text/javascript'>
                   var o = {
                       'site_id' : '" . $data['site_id'] . "', 
                       'second': " . $data['second'] . ",
                       'hash': '" . $data['hash'] . "', 
                       'template': " . $data['template'] . ",
                       'delay': " . $data['delay'] . ",
                       'countShow': " . $data['countShow'] . ",
                        'wp': 'true'
                   };
                   var ClickkyRichmedia = new ClickkyRichmedia(o);
                   ClickkyRichmedia.init();
            </script>
            <!-- {/literal} END CODE -->
        ";
                }
            }
        }
    }


    /**
     * Generate js code Intextads
     * @return string
     */
    public function get_intextads()
    {
        $results = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " WHERE name='Intext' AND status=1");
        if (count($results) > 0) {
            foreach ($results as $result) {
                $data = unserialize($result->data);
                $settings = unserialize($result->settings);
                unset($settings['ads']);
                unset($settings['js_file']);
                if ($this->check_where_show($settings) && $result->status == 1) {
                    return "
                <!-- BEGIN CODE {literal} -->
                <script src='//native.cli.bz/nativeads/intext/js/main.js'></script>
                <script type='text/javascript'>
                       var o = {
                           'site_id' : '" . $data['site_id'] . "', 
                           'countWords': " . $data['countWords'] . ",
                           'lang': '" . $data['lang'] . "',
                           'wp': 'true'
                       };
                       new ClickkyIntext(o).init();
                </script>
                <!-- {/literal} END CODE -->
        ";
                }
            }
        }
    }

    /**
     * Generate js code Giftedads
     * @return string
     */
    public function get_giftedads()
    {
        $results = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " WHERE name='Gift Ads' AND status=1");
        if (count($results) > 0) {
            foreach ($results as $result) {
                $data = unserialize($result->data);
                $settings = unserialize($result->settings);
                unset($settings['ads']);
                unset($settings['js_file']);
                if ($this->check_where_show($settings) && $result->status == 1) {
                    return "
            <!-- BEGIN CODE {literal} -->
            <script src='//native.cli.bz/nativeads/giftedads/js/main.js'></script>
            <script type='text/javascript'>
                   var o = {
                       'site_id' : '" . $data['site_id'] . "', 
                       'hash': '" . $data['hash'] . "', 
                       'positionButton': '" . $data['positionButton'] . "',
                       'delay': " . $data['delay'] . ",
                       'closeButtonDelay': " . $data['closeButtonDelay'] . ",
                       'wp': 'true'
                   };
                   var ClickkyGiftedAds = new ClickkyGiftedAds(o);
                   ClickkyGiftedAds.init();
            </script>
            <!-- {/literal} END CODE -->
        ";
                }
            }
        }
    }


    /**
     * Generate js code Recommended Ads
     * @param $hash
     * @return bool|string
     */
    public function get_recommend($hash)
    {

        return $this->generate_recommended($hash);
    }

    /**
     * Generate shortcode for Recommended Ads
     * @param $args
     * @return bool|string
     */
    public function get_recommended_shortcode($args)
    {

        if (!isset($args['id']) && $args['id'] == '') {
            return false;
        }
        $result = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " WHERE id=" . $args['id'] . " LIMIT 1");

        if ($result) {
            $result = $result[0];
            $data = unserialize($result->data);
            return $this->generate_recommended($data);
        }

    }

    /**
     *
     */
    public function loadTizerJs()
    {
        wp_register_script($this . $this->plugin_name . '-tizer', 'http://native.cli.bz/nativeads/tizer/js/main.js');
    }

    /**
     * Generate javascript for Recommended Ads
     * @param $hash
     * @return bool|string
     */
    public function generate_recommended($data)
    {
        if (!$data) {
            return false;
        }
        $id = uniqid();
        $html = '';
        //add_action( 'wp_enqueue_scripts', array($this, 'loadTizerJs'));
        if (!$this->show) {
            $html .= "<script src='//native.cli.bz/nativeads/tizer/js/main.js'></script>";
            $this->show = true;
        }

        $html .= "
                <div id='" . $id . "'></div>
                <!-- BEGIN CODE {literal} -->
                <script type='text/javascript'>
                        var o = {
                            'site_id' : '" . $data['site_id'] . "', 
                            'blockId': '" . $id . "',
                            'hash' : '" . $data['hash'] . "',
                            'template': " . $data['template'] . ",
                            'buttonClassColor': '" . $data['buttonClassColor'] . "',
                            'styles': {
                                'background': '" . $data['background'] . "',
                                'fontFamily': '" . $data['fontFamily'] . "',
                                'colorFontTitle': '" . $data['colorFontTitle'] . "',
                                'colorFontDescription': '" . $data['colorFontDescription'] . "',
                                'ratingFontColor': '" . $data['ratingFontColor'] . "',
                                'buttonBackground': '" . $data['buttonBackground'] . "',
                                'buttonFontColor': '" . $data['buttonFontColor'] . "',
                                'buttonBorderColor': '" . $data['buttonBackground'] . "'
                            },
                            'wp': 'true'
                        };
                        new ClickkyTizer(o).init();
                </script>
                <!-- {/literal} END CODE -->
           
        ";
        return $html;

    }

    /**
     * Check where show banner
     * @param $setting
     * @return bool
     */
    private function check_where_show($setting)
    {

        if ($setting['global'] == 1) {

            if (get_option($this->plugin_name . '_home') == 1) {
                return true;
            }

            if (get_option($this->plugin_name . '_main') == 1) {
                return true;
            }

            if (is_page()) {
                $banner_pages = unserialize(get_option($this->plugin_name . '_page'));
                if (isset($banner_pages)) {
                    if (in_array(get_the_ID(), $banner_pages)) {
                        return true;
                    }
                }
            }

            if (is_single()) {
                $banner_posts = unserialize(get_option($this->plugin_name . '_post'));
                if (isset($banner_posts)) {
                    if (in_array(get_the_ID(), $banner_posts)) {
                        return true;
                    }
                }
            }

            if (is_category()) {
                $category = get_queried_object();
                $banner_categories = unserialize(get_option($this->plugin_name . '_category'));
                if (isset($banner_categories)) {
                    if (in_array($category->term_id, $banner_categories)) {
                        return true;
                    }
                }
            }

            return false;
        }

        if (isset($setting['main'])) {
            return true;
        }

        if (isset($setting['home'])) {
            return true;
        }

        if (is_page()) {
            $banner_pages = $setting['page'];
            if (isset($banner_pages)) {
                if (in_array(get_the_ID(), $banner_pages)) {
                    return true;
                }
            }
        }

        if (is_single()) {
            $banner_posts = $setting['post'];
            if (isset($banner_posts)) {
                if (in_array(get_the_ID(), $banner_posts)) {
                    return true;
                }
            }
        }

        if (is_category()) {
            $category = get_queried_object();
            $banner_categories = $setting['category'];
            if (isset($banner_categories)) {
                if (in_array($category->term_id, $banner_categories)) {
                    return true;
                }
            }
        }

        return false;
    }

}
