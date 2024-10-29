<?php
/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://clickky.biz/
 * @since      1.3.6
 *
 * @package    Clickky
 * @subpackage Clickky/admin
 */

require_once(CLICKKY_PLUGIN_PATH . 'includes/Curl/Curl.php');

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Clickky
 * @subpackage Clickky/admin
 * @author     Your Name <email@example.com>
 */
class Clickky_Admin
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
     * Array of banners
     * @var array
     */
    private $banners = array();

    /**
     * Initialize the class and set its properties.
     *
     * @since      1.3.6
     * @param      string $clickky The name of this plugin.
     * @param      string $version The version of this plugin.
     */
    public function __construct($plugin_name, $version)
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . "clickky_ads";
        $this->plugin_name = $plugin_name;
        $this->version = $version;
        $this->wp_clickky_options = get_option($this->plugin_name);

        $this->banners['banner'] = array(
            'name' => 'Catfish Ads',
            'alias' => 'clickky',
            'callback' => 'catfish',
            'id' => 'banner',
            'js_file' => 'banner',
            'default' => array(
                'widget_id' => array(
                    'type' => 'text',
                    'name' => 'SITE ID',
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'hash' => array(
                    'type' => 'text',
                    'name' => __('Hash', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'delay' => array(
                    'type' => 'text',
                    'name' => __('Delay', 'clickky'),
                    'hover' => __('parameter responsible for the delay time before displaying an advertising banner in seconds', 'clickky'),
                    'help' => __('all positive numeric integers 0 - ad unit display at web page loading without a delay', 'clickky')
                ),
                'template' => array(
                    'type' => 'select',
                    'name' => __('Template', 'clickky'),
                    'hover' => '',
                    'help' => ' <ol class="list-inline">
                                        <li>1 - top-line ,</li>
                                        <li>2 - catfish,</li>
                                        <li>3 - top-line + catfish</li>
                                    </ol>',
                    'values' => array(
                        1 => CLICKKY_PLUGIN_URL . '/admin/img/ads/topcatfish.jpg',
                        2 => CLICKKY_PLUGIN_URL . '/admin/img/ads/bottomcatfish.jpg',
                        3 => CLICKKY_PLUGIN_URL . '/admin/img/ads/topplusbottom.jpg'
                    )
                ),
                'countBanners' => array(
                    'type' => 'hidden',
                    'name' => __('Banners are involved in the slider', 'clickky'),
                    'hover' => __('banners are involved in the slider', 'clickky'),
                    'help' => __('from 0 to 1 inclusive - automatically 1, 2 or 3 templates are triggered
                                    from 2 to 4 inclusive - available for 4, 5, 6 or 7 templates
                                    > 4 - triggered the default value - 3', 'clickky')
                )

            )
        );
        $this->banners['banner_slider'] = array(
            'name' => 'Catfish Ads Slider',
            'alias' => 'clickky/catfish_slider',
            'callback' => 'catfish_slider',
            'id' => 'banner_slider',
            'js_file' => 'banner',
            'default' => array(
                'widget_id' => array(
                    'type' => 'text',
                    'name' => 'SITE ID',
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'hash' => array(
                    'type' => 'text',
                    'name' => __('Hash', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'delay' => array(
                    'type' => 'text',
                    'name' => __('Delay', 'clickky'),
                    'hover' => __('parameter responsible for the delay time before displaying an advertising banner in seconds', 'clickky'),
                    'help' => __('all positive numeric integers 0 - ad unit display at web page loading without a delay', 'clickky')
                ),
                'template' => array(
                    'type' => 'select',
                    'name' => __('Template', 'clickky'),
                    'hover' => '',
                    'help' => ' <ol class="list-inline">
                                         <li>4 - top-line slider (horizontal) ,</li>
                                        <li>5 - catfish slider (horizontal),</li>
                                        <li>6 - top-line slider (vertical), </li>
                                        <li>7 - catfish slider (vertical)</li>
                                    </ol>',
                    'values' => array(
                        4 => CLICKKY_PLUGIN_URL . '/admin/img/ads/topcatfishslider.jpg',
                        5 => CLICKKY_PLUGIN_URL . '/admin/img/ads/bottomcatfishslider.jpg',
                        6 => CLICKKY_PLUGIN_URL . '/admin/img/ads/topcatfishslider.jpg',
                        7 => CLICKKY_PLUGIN_URL . '/admin/img/ads/bottomcatfishslider.jpg'
                    )
                ),
                'countBanners' => array(
                    'type' => 'text',
                    'name' => __('Banners are involved in the slider', 'clickky'),
                    'hover' => __('banners are involved in the slider', 'clickky'),
                    'help' => __('from 0 to 1 inclusive - automatically 1, 2 or 3 templates are triggered
                                    from 2 to 4 inclusive - available for 4, 5, 6 or 7 templates
                                    > 4 - triggered the default value - 3', 'clickky')
                )

            )

        );
        $this->banners['dialog'] = array(
            'name' => 'Dialog Ads',
            'alias' => 'clickky/dialog',
            'callback' => 'dialog',
            'id' => 'dialog',
            'js_file' => 'dialogads',
            'default' => array(
                'widget_id' => array(
                    'type' => 'text',
                    'name' => 'SITE ID',
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'hash' => array(
                    'type' => 'text',
                    'name' => __('Hash', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'delay' => array(
                    'type' => 'text',
                    'name' => __('Delay', 'clickky'),
                    'hover' => __('parameter responsible for the delay time before displaying an advertising banner in seconds', 'clickky'),
                    'help' => __('all positive numeric integers 0 - ad unit display at web page loading without a delay', 'clickky')
                ),
                'template' => array(
                    'type' => 'select',
                    'name' => __('Template', 'clickky'),
                    'hover' => '',
                    'help' => '  <div class="alert  alert-warning">' . __('<strong>Warning!</strong> Any other values for this type of advertising makes the script useless character set, be careful.', 'clickky') . '</div>',
                    'values' => array(
                        0 => CLICKKY_PLUGIN_URL . '/admin/img/ads/dialogone.jpg',
                        1 => CLICKKY_PLUGIN_URL . '/admin/img/ads/dialogone.jpg',
                        2 => CLICKKY_PLUGIN_URL . '/admin/img/ads/dialogtwo.jpg'
                    )
                ),
                'countShow' => array(
                    'type' => 'text',
                    'name' => __('Banners rotation time in minutes', 'clickky'),
                    'hover' => __('banner update happens every (n) minutes', 'clickky'),
                    'help' => __('all positive numeric integers 0 - show the following banner each time you update the current page', 'clickky')
                )

            )
        );
        $this->banners['expandable'] = array(
            'name' => 'Expandable Banner',
            'alias' => 'clickky/expandable_banner',
            'callback' => 'expandable_banner',
            'id' => 'expandable',
            'js_file' => 'slideads',
            'default' => array(
                'widget_id' => array(
                    'type' => 'text',
                    'name' => 'SITE ID',
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'hash' => array(
                    'type' => 'text',
                    'name' => __('Hash', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'template' => array(
                    'type' => 'select',
                    'name' => __('Template', 'clickky'),
                    'hover' => '',
                    'help' => '  <div class="alert  alert-warning">' . __('<strong>Warning!</strong> Any other values for this type of advertising makes the script useless character set, be careful.', 'clickky') . '</div>',
                    'values' => array(
                        0 => '',
                        1 => CLICKKY_PLUGIN_URL . '/admin/img/ads/expand.jpg',
                        2 => CLICKKY_PLUGIN_URL . '/admin/img/ads/expand.jpg',
                        3 => CLICKKY_PLUGIN_URL . '/admin/img/ads/expand.jpg',
                        4 => CLICKKY_PLUGIN_URL . '/admin/img/ads/expand.jpg',
                    )
                ),
                'background' => array(
                    'type' => 'select',
                    'name' => __('Background', 'clickky'),
                    'hover' => __('parameter that defines the background color of the space where the advertisement displays', 'clickky'),
                    'help' => __('dark or light', 'clickky'),
                    'values' => array(
                        'dark' => 'dark',
                        'light' => 'light'
                    )
                ),
                'autoShow' => array(
                    'type' => 'text',
                    'name' => __('Banners rotation time in minutes', 'clickky'),
                    'hover' => __('parameter that determines the delay time before opening the banner in seconds', 'clickky'),
                    'help' => __('from 0 to 60 inclusive  - banner will be opened immediately after the load page', 'clickky')
                )

            )
        );
        $this->banners['fullScreen'] = array(
            'name' => 'Full-screen Ads',
            'alias' => 'clickky/fullscreen',
            'callback' => 'fullscreen',
            'id' => 'fullScreen',
            'js_file' => 'full',
            'default' => array(
                'widget_id' => array(
                    'type' => 'text',
                    'name' => 'SITE ID',
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'hash' => array(
                    'type' => 'text',
                    'name' => __('Hash', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'delay' => array(
                    'type' => 'text',
                    'name' => __('Delay', 'clickky'),
                    'hover' => __('parameter responsible for the delay time before displaying an advertising banner in seconds', 'clickky'),
                    'help' => __('all positive numeric integers 0 - ad unit display at web page loading without a delay', 'clickky')
                ),
                'pageShow' => array(
                    'type' => 'text',
                    'name' => __('Page number on what the ads appears', 'clickky'),
                    'hover' => __('parameter that determines the page number on what the ads appears', 'clickky'),
                    'help' => __('all positive numeric integers 0 - is ignored', 'clickky')
                )

            )
        );

        $this->banners['Intext'] = array(
            'name' => 'Intext',
            'alias' => 'clickky/intext',
            'callback' => 'intext',
            'id' => 'Intext',
            'js_file' => 'intext',
            'default' => array(
                'site_id' => array(
                    'type' => 'text',
                    'name' => 'SITE ID',
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'countWords' => array(
                    'type' => 'text',
                    'name' => __('Number of words', 'clickky'),
                    'hover' => '',
                    'help' => __('Number of words on the page for replace', 'clickky'),
                ),
                'lang' => array(
                    'type' => 'select',
                    'name' => __('Language', 'clickky'),
                    'hover' => '',
                    'help' => __('Site language', 'clickky'),
                    'values' => array(
                        'all' => __('All language', 'clickky'),
                        'ru' => __('Russian language', 'clickky'),
                        'en'=> __('English language', 'clickky')
                    )
                )
            )
        );

        $this->banners['Interstitial'] = array(
            'name' => 'Interstitial',
            'alias' => 'clickky/interstitial',
            'callback' => 'interstitial',
            'id' => 'Interstitial',
            'js_file' => 'popin',
            'default' => array(
                'widget_id' => array(
                    'type' => 'text',
                    'name' => 'SITE ID',
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'hash' => array(
                    'type' => 'text',
                    'name' => __('Hash', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'template' => array(
                    'type' => 'select',
                    'name' => __('Template', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'values' => array(
                        0 => '',
                        1 => CLICKKY_PLUGIN_URL . '/admin/img/ads/interstitialhorcenter.jpg',
                        2 => CLICKKY_PLUGIN_URL . '/admin/img/ads/interstitialhorbottom.jpg',
                        3 => CLICKKY_PLUGIN_URL . '/admin/img/ads/interstitialvertcenter.jpg',
                        4 => CLICKKY_PLUGIN_URL . '/admin/img/ads/interstitialvertbottom1.jpg'
                    )
                ),
                'delay' => array(
                    'type' => 'text',
                    'name' => __('Delay', 'clickky'),
                    'hover' => __('parameter responsible for the delay time before displaying an advertising banner in seconds', 'clickky'),
                    'help' => __('all positive numeric integers 0 - ad unit display at web page loading without a delay', 'clickky')
                ),
                'pageShow' => array(
                    'type' => 'text',
                    'name' => __('Page number on what the ads appears', 'clickky'),
                    'hover' => __('parameter that determines the page number on what the ads appears', 'clickky'),
                    'help' => __('all positive numeric integers 0 - is ignored', 'clickky')
                )

            )

        );

        $this->banners['Gift Ads'] = array(
            'name' => 'Gift Ads',
            'alias' => 'clickky/giftedads',
            'callback' => 'giftedads',
            'id' => 'Gift Ads',
            'js_file' => 'giftedads',
            'default' => array(
                'site_id' => array(
                    'type' => 'text',
                    'name' => 'SITE ID',
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'hash' => array(
                    'type' => 'text',
                    'name' => __('Hash', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'delay' => array(
                    'type' => 'text',
                    'name' => __('Delay', 'clickky'),
                    'hover' => __('delay parameter before advertising opens itself', 'clickky'),
                    'help' => __('all positive numeric integers 0 - ad unit auto open is cancelled', 'clickky')
                ),
                'positionButton' => array(
                    'type' => 'select',
                    'name' => __('Button position', 'clickky'),
                    'hover' => '',
                    'help' => __('gift button position on the site'),
                    'values' => array(
                        'topleft' => 'Top left',
                        'topright' => 'Top right',
                        'bottomleft' => 'Bottom left',
                        'bottomright' => 'Bottom right'
                    )
                ),
                'closeButtonDelay' => array(
                    'type' => 'text',
                    'name' => __('closeButtonDelay', 'clickky'),
                    'hover' => '',
                    'help' =>  __('parameter which indicates the time when the button "close" becomes active', 'clickky'),
                )

            )

        );


        $this->banners['richmedia'] = array(
            'name' => 'Rich media',
            'alias' => 'clickky/richmedia',
            'callback' => 'richmedia',
            'id' => 'richmedia',
            'js_file' => 'media',
            'default' => array(
                'site_id' => array(
                    'type' => 'text',
                    'name' => 'SITE ID',
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'hash' => array(
                    'type' => 'text',
                    'name' => __('Hash', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'attr' => 'disabled'
                ),
                'template' => array(
                    'type' => 'select',
                    'name' => __('Template', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'values' => array(
                        0 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rich.jpg',
                        1 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rich.jpg',
                        2 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rich.jpg',
                        3 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rich.jpg',
                        4 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rich.jpg',
                        5 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rich.jpg',
                        6 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rich.jpg',
                        7 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rich.jpg',
                        8 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rich.jpg',
                        9 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rich.jpg',
                        10 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rich.jpg',
                        11 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rich.jpg',
                        12 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rich.jpg',
                    )
                ),
                'delay' => array(
                    'type' => 'text',
                    'name' => __('Delay', 'clickky'),
                    'hover' => __('parameter responsible for the delay time before displaying an advertising banner in seconds', 'clickky'),
                    'help' => __('all positive numeric integers 0 - ad unit display at web page loading without a delay', 'clickky')
                ),
                'countShow' => array(
                    'type' => 'text',
                    'name' => __('Page number on what the ads appears', 'clickky'),
                    'hover' => __('parameter that determines the page number on what the ads appears', 'clickky'),
                    'help' => __('all positive numeric integers 0 - is ignored', 'clickky')
                ),
                'second' => array(
                    'type' => 'text',
                    'name' => __('Delay time for the close button in seconds', 'clickky'),
                    'hover' => __('parameter that defines the delay time for the close button in seconds', 'clickky'),
                    'help' => __('all positive numeric integers, 0 - the script does not work', 'clickky')
                )

            )

        );
        $this->banners['recommended'] = array(
            'name' => 'Native Apps',
            'alias' => 'clickky/recommended_apps',
            'callback' => 'recommended_apps',
            'id' => 'recommended',
            'js_file' => 'tizer',
            'default' => array(
                'name' => array(
                    'type' => 'text',
                    'name' => __('Name', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'show' => 0
                ),
                'site_id' => array(
                    'type' => 'text',
                    'name' => 'SITE ID',
                    'hover' => '',
                    'help' => '',
                    'show' => 1,
                    'attr' => 'disabled'

                ),
                'blockId' => array(
                    'type' => 'hidden',
                    'name' => '',
                    'hover' => '',
                    'help' => '',
                    'show' => 1,
                    'attr' => 'disabled'
                ),
                'hash' => array(
                    'type' => 'text',
                    'name' => __('Hash', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'show' => 1,
                    'attr' => 'disabled'
                ),
                'template' => array(
                    'type' => 'select',
                    'name' => __('Template', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'values' => array(
                        1 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rec1.jpg',
                        2 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rec2.jpg',
                        3 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rec3.jpg',
                        4 => CLICKKY_PLUGIN_URL . '/admin/img/ads/rec4.jpg',
                    ),
                    'show' => 1
                ),
                'buttonClassColor' => array(
                    'type' => 'select',
                    'name' => __('Button Color', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'values' => array(
                        'white' => 'white',
                        'red' => 'red'
                    ),
                    'show' => 1
                ),
                'background' => array(
                    'type' => 'color',
                    'name' => __('Background', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'value' => '#ffffff',
                    'show' => 0
                ),
                'fontFamily' => array(
                    'type' => 'text',
                    'name' => __('Font Family', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'value' => 'Helvetica,Arial,sans-serif',
                    'show' => 0
                ),
                'colorFontTitle' => array(
                    'type' => 'color',
                    'name' => __('Color font title', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'value' => '#000000',
                    'show' => 0
                ),
                'ratingFontColor' => array(
                    'type' => 'color',
                    'name' => __('Rating Color', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'value' => '#000000',
                    'show' => 0
                ),
                'colorFontDescription' => array(
                    'type' => 'color',
                    'name' => __('Color description', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'value' => '#000000',
                    'show' => 0
                ),
                'buttonBackground' => array(
                    'type' => 'color',
                    'name' => __('Button background', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'value' => '#E63517',
                    'show' => 0
                ),
                'buttonFontColor' => array(
                    'type' => 'color',
                    'name' => __('Button font color', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'value' => '#ffffff',
                    'show' => 0
                ),
                'buttonBorderColor' => array(
                    'type' => 'color',
                    'name' => __('Button border color', 'clickky'),
                    'hover' => '',
                    'help' => '',
                    'value' => '#E63517',
                    'show' => 0
                )


            )
        );
    }

    /**
     * Add plugin menu
     */
    public function add_admin_menu()
    {

        $result = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " ");

        add_menu_page(
            'clickky',
            'Clickky',
            'manage_options',
            'clickky',
            array($this, 'clickky'),
            plugin_dir_url(__FILE__) . 'img/icon.png',
            '2.1'
        );

        remove_submenu_page('clickky', 'clickky');
        if (count($result) > 0) {
            add_submenu_page('clickky', __('Stats', 'clickky'), __('Stats', 'clickky'), 'manage_options', 'clickky', array($this, 'dashboard_page'));
            add_submenu_page('clickky', __('Add placement', 'clickky'), __('Add placement', 'clickky'), 'manage_options', 'add_placement', array($this, 'add_placement_page'));
        } else {
            add_submenu_page('clickky', __('Add placement', 'clickky'), __('Add placement', 'clickky'), 'manage_options', 'clickky', array($this, 'add_placement_page'));
        }
        add_submenu_page('clickky', __('My placement', 'clickky'), __('My placement', 'clickky'), 'manage_options', 'my_placement', array($this, 'my_placement_page'));
        add_submenu_page('clickky', __('Global settings', 'clickky'), __('Global settings', 'clickky'), 'manage_options', 'global_settings', array($this, 'global_settings_page'));

    }

    /**
     * Register the stylesheets for the admin area.
     *
     * @since      1.3.6
     */
    public function enqueue_styles()
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

        if (!empty($_GET)) {
            wp_enqueue_style($this->plugin_name, plugin_dir_url(__FILE__) . 'css/clickky-admin.css', array(), $this->version, 'all');
        }
    }

    /**
     * Register the JavaScript for the admin area.
     *
     * @since      1.3.6
     */
    public function enqueue_scripts()
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
        if (!empty($_GET)) {
            wp_enqueue_script($this->plugin_name, plugin_dir_url(__FILE__) . 'js/clickky-admin.js', array('jquery'), $this->version, false);
        }
    }

    /**
     * Register class
     */
    public function clickky()
    {

    }

    /**
     * Global page settings
     */
    public function global_settings_page()
    {
        require_once plugin_dir_path(__FILE__) . 'partials/clickky-global-settings.php';
    }

    /**
     * @param $curl
     * @param $from
     * @param $to
     * @param $type
     * @return array|int|string
     */
    public function getMetrics($curl, $from, $to, $type)
    {

        $result = array();
        $result = 0;
        foreach ($curl->responseCookies as $k => $v) {
            $curl->setCookie($k, $v);
        }
        if ($type == 'revenue') {

            $curl->get('http://platform.clickky.biz/api/v1.0/clk/front-end/self-service/reports/publisher/total?period=' . $from . ':' . $to . '&metrics[]=payout');
            if (!$curl->error) {
                if ($curl->response->status == 'ok') {
                    if (count($curl->response->result)) {
                        $result = $curl->response->result[0]->payout;
                    } else {
                        $result = 0;
                    }
                }else{
                    $result = 0;
                }
            } else {
                $result = 0;
            }
        } elseif ($type == 'android') {
            $curl->get('http://platform.clickky.biz/api/v1.0/clk/front-end/self-service/reports/publisher/total?period=' . $from . ':' . $to . '&filter_by[os][]=Android&&metrics[]=leads');
            $android = 0;

            if (!$curl->error) {
                if ($curl->response->status == 'ok') {
                    if (isset($curl->response->result[0]->leads)) {
                        $android = $curl->response->result[0]->leads;
                    } else {
                        $android = 0;
                    }
                }else{
                    $android = 0;
                }
            }else{
                $android = 0;
            }

            $curl->get('http://platform.clickky.biz/api/v1.0/clk/front-end/self-service/reports/publisher/total?period=' . $from . ':' . $to . '&filter_by[os][]=iOS&&metrics[]=leads');
            $ios = 0;
            if (!$curl->error) {
                if ($curl->response->status == 'ok') {
                    if (isset($curl->response->result[0]->leads)) {
                        $ios = $curl->response->result[0]->leads;
                    } else {
                        $ios = 0;
                    }
                } else {
                    $ios = 0;
                }
            }else{
                $ios = 0;
            }

            $result = 0;
            if(($android + $ios)!=0) {
                $result = round($android / ($android + $ios) * 100, 0);
            }

            $result = $result.'%';

        } elseif ($type == 'ios') {
            $curl->get('http://platform.clickky.biz/api/v1.0/clk/front-end/self-service/reports/publisher/total?period=' . $from . ':' . $to . '&filter_by[os][]=Android&&metrics[]=leads');
            $android = 0;

            if (!$curl->error) {
                if ($curl->response->status == 'ok') {
                    if (isset($curl->response->result[0]->leads)) {
                        $android = $curl->response->result[0]->leads;
                    } else {
                        $android = 0;
                    }
                }else{
                    $android = 0;
                }
            }else{
                $android = 0;
            }

            $curl->get('http://platform.clickky.biz/api/v1.0/clk/front-end/self-service/reports/publisher/total?period=' . $from . ':' . $to . '&filter_by[os][]=iOS&&metrics[]=leads');
            $ios = 0;
            if (!$curl->error) {
                if ($curl->response->status == 'ok') {
                    if (isset($curl->response->result[0]->leads)) {
                        $ios = $curl->response->result[0]->leads;
                    } else {
                        $ios = 0;
                    }
                } else {
                    $ios = 0;
                }
            }else{
                $ios = 0;
            }

            $result = 0;
            if(($android + $ios)!=0) {
                $result = round($ios/($android+$ios)*100, 0);
            }

            $result = $result.'%';

        } elseif ($type == 'tables') {
            $curl->get('http://platform.clickky.biz/api/v1.0/clk/front-end/self-service/reports/publisher/total?period=' . $from . ':' . $to . '&filter_by[device_type][]=tablet&metrics[]=leads');
            $tables = 0;
            if (!$curl->error) {
                if ($curl->response->status == 'ok') {
                    if (isset($curl->response->result[0]->leads)) {

                        $tables = $curl->response->result[0]->leads;
                    } else {
                        $tables = 0;
                    }
                } else {
                    $tables = 0;
                }
            }else{
                $tables = 0;
            }
            $phones = 0;
            $curl->get('http://platform.clickky.biz/api/v1.0/clk/front-end/self-service/reports/publisher/total?period=' . $from . ':' . $to . '&filter_by[device_type][]=smartphone&metrics[]=leads');
            if (!$curl->error) {
                if ($curl->response->status == 'ok') {
                    if (isset($curl->response->result[0]->leads)) {

                        $phones = $curl->response->result[0]->leads;
                    } else {
                        $phones = 0;
                    }
                } else {
                    $phones = 0;
                }
            }else{
                $phones = 0;
            }

            $result = 0;
            if(($tables+$phones)!=0) {
                $result = round($tables/($tables+$phones)*100, 0);
            }

            $result = $result.'%';

        } elseif ($type == 'phones') {
            $curl->get('http://platform.clickky.biz/api/v1.0/clk/front-end/self-service/reports/publisher/total?period=' . $from . ':' . $to . '&filter_by[device_type][]=tablet&metrics[]=leads');
            $tables = 0;
            if (!$curl->error) {
                if ($curl->response->status == 'ok') {
                    if (isset($curl->response->result[0]->leads)) {

                        $tables = $curl->response->result[0]->leads;
                    } else {
                        $tables = 0;
                    }
                } else {
                    $tables = 0;
                }
            }else{
                $tables = 0;
            }
            $phones = 0;
            $curl->get('http://platform.clickky.biz/api/v1.0/clk/front-end/self-service/reports/publisher/total?period=' . $from . ':' . $to . '&filter_by[device_type][]=smartphone&metrics[]=leads');
            if (!$curl->error) {
                if ($curl->response->status == 'ok') {
                    if (isset($curl->response->result[0]->leads)) {

                        $phones = $curl->response->result[0]->leads;
                    } else {
                        $phones = 0;
                    }
                } else {
                    $phones = 0;
                }
            }else{
                $phones = 0;
            }

            $result = 0;
            if(($tables+$phones)!=0) {
                $result = round($phones/($tables+$phones)*100, 0);
            }

            $result = $result.'%';

        }


        return $result;
    }

    /**
     * Dashboard page
     */
    public function dashboard_page()
    {

        $result = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " ");

        if (isset($_POST['username'])) {
            $curl = new Curl();
            $curl->setHeader('Content-Type', 'application/json');
            $curl->post('http://platform.clickky.biz/api/v1.0/clk/front-end/login', array(
                'username' => $_POST['username'],
                'password' => $_POST['password'],
                'remember' => true,
            ));
            if ($curl->error) {
                $message =  __('WRONG EMAIL OR PASSWORD', 'clickky');
            } else {
                add_option('clickky_login', $_POST['username'], '', $autoload = 'yes');
                add_option('clickky_password', $_POST['password'], '', $autoload = 'yes');
            }

        }

        $data = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " ");
        $result = array();

        foreach ($data as $k => $v) {
            $settings = unserialize($v->settings);

            $result[] = array(

                'original_id' => $v->id,
                'name' => $v->name,
                'status' => $v->status,
                'id' => $settings['ads'],
                'js_file' => $settings['js_file'],
                'result' => unserialize($v->data),
                'default' => $this->banners[$data['id']]['default']
            );

        }
        require_once plugin_dir_path(__FILE__) . 'partials/clickky-main.php';

    }

    /**
     * Add placement page
     */
    public function add_placement_page()
    {
        require_once plugin_dir_path(__FILE__) . 'partials/clickky-add-placement.php';
    }


    /**
     *  Publish js code
     */
    public function publish_ad_javascript()
    {
        ?>
        <script type="text/javascript">

            jQuery(".switch input").on('change', function (event) {
                var id =jQuery(this).data('id');
                jQuery.ajax({
                    type: "POST",
                    data: {
                        'switch': jQuery(this).prop('checked'),
                        status: 'publish',
                        action: 'publish_action',
                        id: jQuery(this).data('id')
                    },
                    url: ajaxurl,
                    success: function (result) {
                        if(jQuery('.td_'+id).hasClass('unchecked')){
                            jQuery('.td_'+id).removeClass('unchecked');
                        }else {
                            jQuery('.td_'+id).addClass('unchecked');
                        }

                    }
                });
                return false;
            });

            jQuery(".ads_list .delete a").on('click', function (event) {

                var is = confirm("Вы действительно хотите удалить?");
                if (is) {
                    var self = this;
                    jQuery.ajax({
                        type: "POST",
                        data: {
                            action: 'publish_action',
                            status: 'delete',
                            id: jQuery(this).data('id')
                        },
                        url: ajaxurl,
                        success: function () {
                            jQuery(self).parent().parent().remove();
                        }
                    });
                }
                return false;
            });

        </script>
        <?php
    }


    /**
     * Callback
     */
    public function publish_action_callback()
    {

        if ($_POST['status'] == 'publish') {

            $status = 1;
            if ($_POST['switch'] == 'false') {
                $status = 0;
            }
            $this->wpdb->get_results("UPDATE " . $this->table_name . " SET status = " . $status . " WHERE id=" . $_POST['id'] . " LIMIT 1");
            wp_die();
        } elseif ($_POST['status'] == 'delete') {

            $this->wpdb->get_results("DELETE  FROM " . $this->table_name . " WHERE id=" . $_POST['id']);
            wp_die();
        }
    }

    /**
     *  Dashboard data
     */
    public function load_dashboard_data()
    {

        $d = date('Y-m-d', time());
        $d_e = explode('-', $d);
        $d_f = date("Y-m-d", strtotime("first day of previous month"));
        $lists = array(
            array(
                'type' => 'revenue',
                'from' => date('Y-m-d', time()),
                'to' => date('Y-m-d', time()),
                'select' => '#revenue .today'
            ),
            array(
                'type' => 'revenue',
                'from' => date('Y-m-d', time() - 86400),
                'to' => date('Y-m-d', time() - 86400),
                'select' => '#revenue .yesterday'
            ),
            array(
                'type' => 'revenue',
                'from' => date('Y-m-d', time() - (86400 * 7)),
                'to' => date('Y-m-d', time()),
                'select' => '#revenue .seven'
            ),
            array(
                'type' => 'revenue',
                'from' => $d_e[0] . '-' . $d_e[1] . '-01',
                'to' => date('Y-m-d', time()),
                'select' => '#revenue .this_month'
            ),
            array(
                'type' => 'revenue',
                'from' => $d_f,
                'to' => date("Y-m-d", strtotime("last day of previous month")),
                'select' => '#revenue .last_month'
            ),
            array(
                'type' => 'revenue',
                'from' => '2016-01-01',
                'to' => date('Y-m-d', time()),
                'select' => '#revenue .all_time'
            ),


            array(
                'type' => 'android',
                'from' => date('Y-m-d', time()),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .today.android'
            ),
            array(
                'type' => 'ios',
                'from' => date('Y-m-d', time()),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .today.ios'
            ),
            array(
                'type' => 'tables',
                'from' => date('Y-m-d', time()),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .today.tables'
            ),
            array(
                'type' => 'phones',
                'from' => date('Y-m-d', time()),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .today.phones'
            ),


            array(
                'type' => 'android',
                'from' => date('Y-m-d', time() - 86400),
                'to' => date('Y-m-d', time() - 86400),
                'select' => '.devices .yesterday.android'
            ),
            array(
                'type' => 'ios',
                'from' => date('Y-m-d', time() - 86400),
                'to' => date('Y-m-d', time() - 86400),
                'select' => '.devices .yesterday.ios'
            ),
            array(
                'type' => 'tables',
                'from' => date('Y-m-d', time() - 86400),
                'to' => date('Y-m-d', time() - 86400),
                'select' => '.devices .yesterday.tables'
            ),
            array(
                'type' => 'phones',
                'from' => date('Y-m-d', time() - 86400),
                'to' => date('Y-m-d', time() - 86400),
                'select' => '.devices .yesterday.phones'
            ),


            array(
                'type' => 'android',
                'from' => date('Y-m-d', time() - (86400 * 7)),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .seven.android'
            ),
            array(
                'type' => 'ios',
                'from' => date('Y-m-d', time() - (86400 * 7)),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .seven.ios'
            ),
            array(
                'type' => 'tables',
                'from' => date('Y-m-d', time() - (86400 * 7)),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .seven.tables'
            ),
            array(
                'type' => 'phones',
                'from' => date('Y-m-d', time() - (86400 * 7)),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .seven.phones'
            ),


            array(
                'type' => 'android',
                'from' => date('Y-m-d', time() - (86400 * 30)),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .this_month.android'
            ),
            array(
                'type' => 'ios',
                'from' => date('Y-m-d', time() - (86400 * 30)),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .this_month.ios'
            ),
            array(
                'type' => 'tables',
                'from' => date('Y-m-d', time() - (86400 * 30)),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .this_month.tables'
            ),
            array(
                'type' => 'phones',
                'from' => date('Y-m-d', time() - (86400 * 30)),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .this_month.phones'
            ),

            array(
                'type' => 'android',
                'from' => date('Y-m-d', time() - (86400 * 90)),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .three_month.android'
            ),
            array(
                'type' => 'ios',
                'from' => date('Y-m-d', time() - (86400 * 90)),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .three_month.ios'
            ),
            array(
                'type' => 'tables',
                'from' => date('Y-m-d', time() - (86400 * 90)),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .three_month.tables'
            ),
            array(
                'type' => 'phones',
                'from' => date('Y-m-d', time() - (86400 * 90)),
                'to' => date('Y-m-d', time()),
                'select' => '.devices .three_month.phones'
            ),

        );

        if($_GET['page']=='clickky') {
            ?>
            <script type="text/javascript">
                jQuery(document).ready(function () {
                    <?php
                    foreach ($lists as $k => $v) {
                        echo "jQuery.ajax({
                            type: 'POST',
                            data: {
                                'from': '" . $v['from'] . "',
                                'to': '" . $v['to'] . "',
                                'type': '" . $v['type'] . "',
                                action: 'load_dashboard'
                            },
                            url: ajaxurl,
                            success: function (result) {
                                jQuery('" . $v['select'] . "').html(result);
                            }
                        });";
                    }
                    ?>
                });

            </script>
            <?php
        }
    }

    /**
     * Dashoard callback
     */
    public function load_dashboard_callback()
    {

        if (isset($_POST['action'])) {
            if (get_option('clickky_login') || get_option('clickky_password')) {

                $curl = new Curl();
                $curl->setHeader('Content-Type', 'application/json');
                $curl->post('http://platform.clickky.biz/api/v1.0/clk/front-end/login', array(
                    'username' => get_option('clickky_login'),
                    'password' => get_option('clickky_password'),
                    'remember' => true,
                ));

                if ($curl->error) {
                    if($_POST['type'] == 'android' || $_POST['type']=='ios' || $_POST['type']=='tables' || $_POST['type']=='phones'){
                        echo '0%';
                    }else{
                        echo '0';
                    }

                } else {
                    echo $this->getMetrics($curl, $_POST['from'], $_POST['to'], $_POST['type']);
                }
                //echo "Время выполнения скрипта: ".(microtime(true) - $start);
            }
        }
        wp_die();
    }

    /**
     *  Dashboard data
     */
    public function load_table_data()
    {
        if($_GET['page']=='clickky'){
        ?>
        <script type="text/javascript">

            function load_totals_data(from ,to) {

                var all_filter = '';

                jQuery('.ads_list tr.ads').each(function (index, value) {
                    var id = jQuery(this).data('id');
                    var original_id = jQuery(this).data('original-id');
                    all_filter += '&filter_by[placement][]='+id;
                    jQuery.ajax({
                        type: 'POST',
                        data: {
                            type: 'some',
                            action: 'load_table',
                            filter: id,
                            from: from,
                            to: to
                        },
                        url: ajaxurl,
                        success: function (result) {
                            var td = jQuery('.td_'+original_id).find('td');
                            try{
                                var r = JSON.parse(result);
                                jQuery(td[2]).html(r[0].requests);
                                jQuery(td[3]).html(r[0].responses);
                                jQuery(td[4]).html(r[0].valid_impressions);
                                jQuery(td[5]).html(r[0].valid_clicks);
                                jQuery(td[6]).html(r[0].ctr);
                                jQuery(td[7]).html(r[0].payout);
                                jQuery(td[8]).html(r[0].ecpm);
                                jQuery(td[9]).html(r[0].fillrate_overall);
                            }catch (e){
                                jQuery(td[2]).html(0);
                                jQuery(td[3]).html(0);
                                jQuery(td[4]).html(0);
                                jQuery(td[5]).html(0);
                                jQuery(td[6]).html(0);
                                jQuery(td[7]).html(0);
                                jQuery(td[8]).html(0);
                                jQuery(td[9]).html(0);
                                console.log(e);
                            }
                        }
                    });

                });
                console.log(all_filter);
                jQuery.ajax({
                    type: 'POST',
                    data: {
                        type: 'total',
                        action: 'load_table',
                        from: from,
                        to: to,
                        all_filter: all_filter
                    },
                    url: ajaxurl,
                    success: function (result) {
                        try{
                            var r = JSON.parse(result);
                            jQuery('.all_foot .all_requests').html(r[0].requests);
                            jQuery('.all_foot .all_responses').html(r[0].responses);
                            jQuery('.all_foot .all_impressions').html(r[0].valid_impressions);
                            jQuery('.all_foot .all_clicks').html(r[0].valid_clicks);
                            jQuery('.all_foot .all_ctr').html(r[0].ctr);
                            jQuery('.all_foot .all_payout').html(r[0].payout);
                            jQuery('.all_foot .all_ecpm').html(r[0].ecpm);
                            jQuery('.all_foot .all_fillrate_overall').html(r[0].fillrate_overall);
                        }catch (e){
                            jQuery('.all_foot .all_requests').html(0);
                            jQuery('.all_foot .all_responses').html(0);
                            jQuery('.all_foot .all_impressions').html(0);
                            jQuery('.all_foot .all_clicks').html(0);
                            jQuery('.all_foot .all_ctr').html(0);
                            jQuery('.all_foot .all_payout').html(0);
                            jQuery('.all_foot .all_ecpm').html(0);
                            jQuery('.all_foot .all_fillrate_overall').html(0);
                            console.log(e);
                        }
                    }
                });
            }

            jQuery(document).ready(function () {

                load_totals_data(jQuery('#datepicker').val(), jQuery('#datepicker').val());

                jQuery('.datepicker-here').datepicker({
                    range: true,
                    dateFormat: 'd M yyyy',
                    language: 'en',
                    toggleSelected: true,
                    autoClose:true,
                    altField:'#datepicker',
                    altFieldDateFormat:'yyyy-m-d',
                    onSelect: function (formattedDate, date, inst) {
                        var dates = jQuery('#datepicker').val();
                        var ds = dates.split(' - ');
                        if(ds.length == 2){
                            var html ='<div class="preloader-wrapper small active"><div class="spinner-layer spinner-green-only"><div class="circle-clipper left"> <div class="circle"></div> </div><div class="gap-patch"> <div class="circle"></div> </div><div class="circle-clipper right"> <div class="circle"></div> </div></div></div>';
                            jQuery('.ads_list .preloa').html(html);
                            load_totals_data(ds[0], ds[1]);
                        }

                    }
                });

            });

        </script>
        <?php
        }
    }
    /**
     * Dashoard callback
     */
    public function load_table_callback()
    {

        if (isset($_POST['action'])) {
            if (get_option('clickky_login') || get_option('clickky_password')) {

                $curl = new Curl();
                $curl->setHeader('Content-Type', 'application/json');
                $curl->post('http://platform.clickky.biz/api/v1.0/clk/front-end/login', array(
                    'username' => get_option('clickky_login'),
                    'password' => get_option('clickky_password'),
                    'remember' => true,
                ));

                if ($curl->error) {
                    echo 'Error: ' . $curl->errorCode . ': ' . $curl->errorMessage;
                } else {
                    foreach ($curl->responseCookies as $k => $v) {
                        $curl->setCookie($k, $v);
                    }
                    if($_POST['type'] == 'some'){

                        $curl->get('http://platform.clickky.biz/api/v1.0/clk/front-end/self-service/reports/publisher?metrics[]=resource_id&metrics[]=resource_name&metrics[]=placement_id&metrics[]=placement_name&metrics[]=placement_type&metrics[]=requests&metrics[]=responses&metrics[]=valid_impressions&metrics[]=valid_clicks&metrics[]=ctr&metrics[]=ecpm&metrics[]=payout&metrics[]=fillrate_overall&limit=100&page=1&period='.$_POST['from'].':'.$_POST['to'].'&filter_by[placement][]='.$_POST['filter']);
                    }else {
                        $curl->get('http://platform.clickky.biz/api/v1.0/clk/front-end/self-service/reports/publisher/total?metrics[]=resource_id&metrics[]=resource_name&metrics[]=placement_id&metrics[]=placement_name&metrics[]=placement_type&metrics[]=requests&metrics[]=responses&metrics[]=valid_impressions&metrics[]=valid_clicks&metrics[]=ctr&metrics[]=ecpm&metrics[]=payout&metrics[]=fillrate_overall&limit=100&page=1&period='.$_POST['from'].':'.$_POST['to'].''.$_POST['all_filter']);
                    }
                    if (!$curl->error) {
                        /*var_dump($curl->response);
                        exit();*/
                        if ($curl->response->status == 'ok') {
                            echo json_encode($curl->response->result);
                        }
                    } else {
                        echo 'Error: ' . $curl->errorCode . ': ' . $curl->errorMessage;
                    }
                }

            }
        }
        wp_die();
    }

    /**
     * Javascript
     */
    public function check_ad_javascript()
    {
        ?>
        <script type="text/javascript">
            jQuery(".add_button").on('click', function (event) {
                if (jQuery('#code').val() == '') {
                    return false;
                }
                jQuery.ajax({
                    type: "POST",
                    data: {'code': jQuery('#code').val(), action: 'check_action'},
                    url: ajaxurl,
                    success: function (result) {
                        result = JSON.parse(result);
                        if (typeof result == 'object') {
                            console.log(result.status);
                            jQuery("#hide_code").val(jQuery('#code').val());
                            jQuery("#code").val(result.message);
                            jQuery("#code").addClass('active');
                            if (result.status) {
                                jQuery(".replace").html('<button class="btn right" type="submit"><?php _e('Next'); ?></button>');
                            }
                        }
                    }
                });
                return false;
            });
            jQuery("#code").on('click', function (event) {
                jQuery("#code").val('');
                jQuery("#code").removeClass('active');
            });
        </script>
        <?php
    }

    /**
     * Callback
     */
    public function check_action_callback()
    {

        if (isset($_POST['code'])) {
            $code = $_POST['code'];
            $data = $this->validate_ad($code);
            if ($data) {
                echo '{"status":1, "message":"' . __('You put correct code! You should turn on placement on my placement page or change delivery setting to this placement there!', 'clickky') . '"}';
            } else {
                echo '{"status":0, "message":"' . __('Check your code', 'clickky') . '"}';
            }

            wp_die();
        }

    }

    /**
     * My placement page
     */
    public function my_placement_page()
    {


        if (isset($_GET['id'])) {

            $id = $_GET['id'];

            if (isset($_POST['name'])) {

                if (isset($_POST['data']['active'])) {
                    $status = $_POST['data']['active'];
                } else {
                    $status = 0;
                }

                if ($id == 0) {

                    $rows_affected = $this->wpdb->insert($this->table_name,
                        array(
                            'name' => $_POST['name'],
                            'data' => serialize($_POST['data']),
                            'settings' => serialize($_POST['settings']),
                            'status' => $status
                        )
                    );

                    if ($rows_affected) {
                        echo "<script>window.location.href='admin.php?page=my_placement';</script>;";
                        wp_die();
                    }

                } else {
                    $rows_affected = $this->wpdb->update($this->table_name,
                        array(
                            'name' => $_POST['name'],
                            'data' => serialize($_POST['data']),
                            'settings' => serialize($_POST['settings']),
                            'status' => $status
                        ),
                        array('id' => $id)
                    );
                }
            }


            if ($id == 0) {
                $code = $_POST['code'];
                $data = $this->validate_ad($code);
            } else {
                $data = array();
                $result = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " WHERE id=" . $id . " LIMIT 1");

                if ($result) {
                    $result = $result[0];
                    $settings = unserialize($result->settings);
                    $data['original_id'] = $result->id;
                    $data['name'] = $result->name;
                    $data['status'] = $result->status;
                    $data['id'] = $settings['ads'];
                    $data['js_file'] = $settings['js_file'];
                    $data['result'] = unserialize($result->data);
                    $data['default'] = $this->banners[$data['id']]['default'];
                }

            }

            require_once plugin_dir_path(__FILE__) . 'partials/clickky-edit-placement.php';
        } else {

            $data = $this->wpdb->get_results("SELECT * FROM " . $this->table_name . " ");
            $result = array();

            foreach ($data as $k => $v) {
                $settings = unserialize($v->settings);

                $result[] = array(

                    'original_id' => $v->id,
                    'name' => $v->name,
                    'status' => $v->status,
                    'id' => $settings['ads'],
                    'js_file' => $settings['js_file'],
                    'result' => unserialize($v->data),
                    'default' => $this->banners[$data['id']]['default']
                );

            }

            require_once plugin_dir_path(__FILE__) . 'partials/clickky-my-placement.php';
        }

    }


    /**
     * @param $code
     * @return bool|mixed|string
     */
    public function validate_ad($code)
    {

        $ads = '';
        $code = stripcslashes($code);
        $count = preg_match_all('/src=(["\'])(.*?)\1/', $code, $match);

        if ($count === FALSE || empty($match[2])) {
            return false;
        } else {

            foreach ($this->banners as $banner) {

                if (strpos($match[2][0], $banner['js_file']) !== false) {
                    $ads = $banner;
                    break;
                }
            }
        }

        if ($ads == '') {
            return false;
        }


        preg_match_all("/(.'.*?'*:.*)/", $code, $output_array);

        if (count($output_array[0]) == 1) {
            preg_match_all("/{(.'.*?'*:.*)}/", $code, $output);

        }

        if (count($output[1]) > 0) {
            $output_array[0] = explode(',', $output[1][0]);
        }
        $data = array();
        if ($output_array[0]) {
            foreach ($output_array[0] as &$value) {

                $value = str_replace("'", "", $value);
                $value = explode(':', $value);
                if (count($value) == 2) {
                    $v = explode(',', $value[1]);

                    $data[trim($value[0])] = trim($v[0]);
                }
            }
        }


        if (empty($data) || !$ads) {
            return false;
        }

        $valid = true;
        foreach ($data as $k => $v) {
            if (!in_array($k, array_keys($ads['default']))) {
                $valid = false;
                break;
            }
        }

        /*if (count($ads['default']) != count($data)) {
            return false;
        }*/
        if ($ads['id'] == 'banner' && $data['template'] > 3) {
            $ads = $this->banners['banner_slider'];
        }

        $ads['result'] = $data;
        if ($valid) {
            return $ads;
        }
        return false;
    }


    /**
     * Update option
     */
    public function options_update()
    {
        register_setting($this->plugin_name, $this->plugin_name, array($this, 'validate'));
    }

    /**
     * Validate input data
     * @param $input
     * @return array
     */
    public function validate($input)
    {
        $valid = array();
        return $valid;
    }

    /**
     * Register setting
     */
    public function register_settings()
    {

        register_setting($this->plugin_name . '-settings', $this->plugin_name . '_home');
        register_setting($this->plugin_name . '-settings', $this->plugin_name . '_main');
        register_setting($this->plugin_name . '-settings', $this->plugin_name . '_page', array($this, 'serializeData'));
        register_setting($this->plugin_name . '-settings', $this->plugin_name . '_post', array($this, 'serializeData'));
        register_setting($this->plugin_name . '-settings', $this->plugin_name . '_category', array($this, 'serializeData'));

    }


    /**
     * Serialize data
     * @param $data
     * @return string
     */
    public function serializeData($data)
    {

        return serialize($data);
    }

    /**
     * Top navigation
     * @param $active
     * @return string
     */
    public function topNavigation($active = '')
    {

        $class_global = '';
        $my_placement = '';
        if ($active == 'global') {
            $class_global = 'active';
        }
        if ($active == 'my-placement') {
            $my_placement = 'active';
        }

        $html = '
            <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
            <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" rel="stylesheet"
                  integrity="sha384-T8Gy5hrqNKT+hzMclPo118YTQO6cYprQmhrYwIiQ/3axmI1hQomh7Ud2hPOy8SP1" crossorigin="anonymous">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            <div class="row header">
                <div class="col s2 logo">
                    <img src="' . CLICKKY_PLUGIN_URL . '/admin/img/logo.png" height="42" alt="">
                </div>
                <div class="col s10">
                    <ul class="right top_menu">
                        <li class="' . $my_placement . '">
                            <a href="admin.php?page=my_placement">
                                <img src="' . CLICKKY_PLUGIN_URL . '/admin/img/my_placement_icon.png" width="40" alt="My placement" />
                                <span class="text">' . __('My placement', 'clickky') . '</span>
                            </a>
                        </li>
                        <li class="' . $class_global . '">
                            <a href="admin.php?page=global_settings">
                                <img src="' . CLICKKY_PLUGIN_URL . '/admin/img/global_settings_icon.png"  width="40" alt="Global settings" />
                                <span>' . __('Global settings', 'clickky') . '</span>
                            </a>
                        </li>
                        <li>
                            <a class="btn" href="admin.php?page=add_placement">' . __('ADD PLACEMENT', 'clickky') . '</a>
                        </li>
                    </ul>
                </div>
            </div>
        ';


        return $html;
    }

    /**
     * @param $name
     * @param $value
     * @param $data
     * @return string
     */
    public function createField($name, $value, $data)
    {

        if ($value['type'] == 'text' || $value['type'] == 'hidden' || $value['type'] == 'color') {
            if ($value['type'] == 'hidden') {
                $html = '<div class="form-group" style="display: none;">';
            } else {
                $html = '<div class="form-group">';
            }
            $html .= '<label for="' . $data['id'] . '_' . $name . '" class="text-uppercase"> ' . __($value['name'], 'clickky');
            if ($value['hover'] != '') {
                $html .= ' <i class="fa fa-info-circle fa-lg" aria-hidden="true" data-toggle="tooltip"
                                               data-placement="right"
                                               title="' . __($value['hover'], 'clickky') . '"></i>';
            }
            $html .= '</label>';

            if ($data['result'][$name] != '') {
                $v = $data['result'][$name];
            } else {
                $v = $data['default'][$name]['value'];
            }
            $disabled = '';
            if (isset($data['default'][$name]['attr'])) {
                $disabled = 'readonly';
            }
            $html .= '<input ' . $disabled . ' type="' . $value['type'] . '" class="form-control" id="' . $data['id'] . '_' . $name . '"
                               placeholder="' . __($value['name'], 'clickky') . '"
                               name="data[' . $name . ']"
                               value="' . $v . '"
                               required>';
            $html .= '<span id="helpBlock" class="help-block">' . __($value['help'], 'clickky') . '</span>';
            $html .= '</div>';
        } elseif ($value['type'] == 'select') {

            $html = '<div class="form-group">';

            $html .= '<label for="' . $data['id'] . '_' . $name . '" class="text-uppercase"> ' . __($value['name'], 'clickky');
            if ($value['hover'] != '') {
                $html .= ' <i class="fa fa-info-circle fa-lg" aria-hidden="true" data-toggle="tooltip"
                                               data-placement="right"
                                               title="' . __($value['hover'], 'clickky') . '"></i>';
            }
            $html .= '</label>';
            $script = "changeTemplateImg('" . $data['id'] . "_" . $name . "', 'banner-" . $name . "-change');";


            $html .= '<select  id="' . $data['id'] . '_' . $name . '" class="browser-default" 
                                onchange="' . $script . '"
                                name="data[' . $name . ']">';

            foreach ($value['values'] as $k => $img) {
                $s = '';
                if ($data['result'][$name] == $k)
                    $s = 'selected';

                $html .= '<option
                                value="' . $k . '" ' . $s . ' 
                                data-bannerimg="' . $img . '">
                                ' . $k . '
                            </option>';
            }

            $html .= '</select>';
            $html .= '<span id="helpBlock" class="help-block">' . __($value['help'], 'clickky') . '</span>';
            $html .= '</div>';
        }


        return $html;
    }

    /**
     * Html setting pages, posts, categories
     * @param $active
     */
    public function pageShow($active)
    {

    }

    /**
     * Footer
     */
    public function htmlFooter()
    {
        ?>
        <div id="footer">
            <div class="container">
                <p class="muted credit">
                    Copyright ©<?php echo date('Y'); ?> Clickky Ltd. All rights reserved.<br>
                    Clickky Banner for WordPress is Free Software distributed under the
                    <a href="http://www.gnu.org/licenses/gpl.html">GNU GPL version 3</a> or any later version published
                    by
                    the FSF.
                </p>
            </div>
        </div>

        <?php
    }
}
