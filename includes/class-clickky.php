<?php
/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://clickky.biz/
 * @since      1.3.6
 *
 * @package    Clickky
 * @subpackage Clickky/includes
 */

class Clickky
{


    /**
     * The loader that's responsible for maintaining and registering all hooks that power
     * the plugin.
     *
     * @since      1.3.6
     * @access   protected
     * @var      Clickky_Loader $loader Maintains and registers all hooks for the plugin.
     */
    protected $loader;

    /**
     * The unique identifier of this plugin.
     *
     * @since      1.3.6
     * @access   protected
     * @var      string $clickky The string used to uniquely identify this plugin.
     */
    protected $clickky;

    /**
     * The current version of the plugin.
     *
     * @since      1.3.6
     * @access   protected
     * @var      string $version The current version of the plugin.
     */
    protected $version;

    /**
     * Define the core functionality of the plugin.
     *
     * Set the plugin name and the plugin version that can be used throughout the plugin.
     * Load the dependencies, define the locale, and set the hooks for the admin area and
     * the public-facing side of the site.
     *
     * @since      1.3.6
     */
    public function __construct()
    {

        $this->plugin_name = 'clickky';
        $this->version = '1.3.6';

        $this->load_dependencies();
        $this->set_locale();
        $this->define_admin_hooks();
        $this->define_public_hooks();

    }

    /**
     * Load the required dependencies for this plugin.
     *
     * Include the following files that make up the plugin:
     *
     * - Clickky_Loader. Orchestrates the hooks of the plugin.
     * - Clickky_i18n. Defines internationalization functionality.
     * - Clickky_Admin. Defines all hooks for the admin area.
     * - Clickky_Public. Defines all hooks for the public side of the site.
     *
     * Create an instance of the loader which will be used to register the hooks
     * with WordPress.
     *
     * @since      1.3.6
     * @access   private
     */
    private function load_dependencies()
    {

        /**
         * The class responsible for orchestrating the actions and filters of the
         * core plugin.
         */
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-clickky-loader.php';

        /**
         * The class responsible for defining internationalization functionality
         * of the plugin.
         */
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-clickky-i18n.php';

        /**
         * The class responsible for defining all actions that occur in the admin area.
         */
        require_once plugin_dir_path(dirname(__FILE__)) . 'admin/class-clickky-admin.php';

        /**
         * The class responsible for defining all actions that occur in the public-facing
         * side of the site.
         */
        require_once plugin_dir_path(dirname(__FILE__)) . 'public/class-clickky-public.php';

        /**
         * The class responsible for defining all widget for Recommended Apps
         * side of the site.
         */
        require_once plugin_dir_path(dirname(__FILE__)) . 'public/class-clickky-widget-public.php';

        $this->loader = new Clickky_Loader();


    }

    /**
     * Define the locale for this plugin for internationalization.
     *
     * Uses the Clickky_i18n class in order to set the domain and to register the hook
     * with WordPress.
     *
     * @since      1.3.6
     * @access   private
     */
    private function set_locale()
    {

        $plugin_i18n = new Clickky_i18n();
        $this->loader->add_action('plugins_loaded', $plugin_i18n, 'load_plugin_textdomain');

    }

    /**
     * Register all of the hooks related to the admin area functionality
     * of the plugin.
     *
     * @since      1.3.6
     * @access   private
     */
    private function define_admin_hooks()
    {

        $plugin_admin = new Clickky_Admin($this->get_plugin_name(), $this->get_version());

        $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_styles');
        $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts');

        $this->loader->add_action('admin_menu', $plugin_admin, 'add_admin_menu');
        $this->loader->add_action('admin_init', $plugin_admin, 'options_update');

        $this->loader->add_action('admin_init', $plugin_admin, 'register_settings');

        $this->loader->add_action('admin_print_footer_scripts', $plugin_admin, 'check_ad_javascript');
        $this->loader->add_action('wp_ajax_check_action', $plugin_admin, 'check_action_callback');

        $this->loader->add_action('admin_print_footer_scripts', $plugin_admin, 'publish_ad_javascript');
        $this->loader->add_action('wp_ajax_publish_action', $plugin_admin, 'publish_action_callback');



            $this->loader->add_action('admin_print_footer_scripts', $plugin_admin, 'load_dashboard_data');
            $this->loader->add_action('wp_ajax_load_dashboard', $plugin_admin, 'load_dashboard_callback');

            $this->loader->add_action('admin_print_footer_scripts', $plugin_admin, 'load_table_data');
            $this->loader->add_action('wp_ajax_load_table', $plugin_admin, 'load_table_callback');



    }

    /**
     * Register all of the hooks related to the public-facing functionality
     * of the plugin.
     *
     * @since      1.3.6
     * @access   private
     */
    private function define_public_hooks()
    {

        $plugin_public = new Clickky_Public($this->get_plugin_name(), $this->get_version());

        $this->loader->add_action('wp_footer', $plugin_public, 'enqueue_banner');

        //$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'loadTizerJs');

        $this->loader->add_filter('the_content', $plugin_public, 'enqueue_recommend_banner_content');
        $this->loader->add_action('comment_form_before', $plugin_public, 'enqueue_recommend_banner_comment_before');
        $this->loader->add_action('comment_form_after', $plugin_public, 'enqueue_recommend_banner_comment_after');
        //$this->loader->add_action('the_post', $plugin_public, 'enqueue_recommend_banner_before_title');

        $this->loader->add_action('loop_start', $plugin_public, 'enqueue_recommend_banner_loop_start');
        $this->loader->add_action('loop_end', $plugin_public, 'enqueue_recommend_banner_loop_end');

        global $wpdb;
        $table_name = $wpdb->prefix . "clickky_ads";


       $this->recommendeds = $wpdb->get_results("SELECT * FROM " . $table_name . " WHERE name='Native Apps' AND status=1");
        if (count($this->recommendeds) > 0) {
            foreach ($this->recommendeds as $result) {
                $settings = unserialize($result->settings);
                if ($settings['widget'] == 1) {
                    $plugin_widget = new Clickky_Widget($this->get_plugin_name(), $this->get_version(), $plugin_public, $result);
                    $this->loader->add_action('widgets_init', $plugin_widget, 'clickky_register_widget');
                }
            }
        }


        add_shortcode('clickky_recommended_apps', array($plugin_public, 'get_recommended_shortcode'));

    }

    /**
     * Run the loader to execute all of the hooks with WordPress.
     *
     * @since      1.3.6
     */
    public function run()
    {
        $this->loader->run();
    }

    /**
     * The name of the plugin used to uniquely identify it within the context of
     * WordPress and to define internationalization functionality.
     *
     * @since      1.3.6
     * @return    string    The name of the plugin.
     */
    public function get_plugin_name()
    {
        return $this->plugin_name;
    }

    /**
     * The reference to the class that orchestrates the hooks with the plugin.
     *
     * @since      1.3.6
     * @return    Clickky_Loader    Orchestrates the hooks of the plugin.
     */
    public function get_loader()
    {
        return $this->loader;
    }

    /**
     * Retrieve the version number of the plugin.
     *
     * @since      1.3.6
     * @return    string    The version number of the plugin.
     */
    public function get_version()
    {
        return $this->version;
    }


}
