<?php

/**
 * The widget plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.3.6
 * @package    Clickky
 * @subpackage Clickky/includes
 * @author     Your Name <email@example.com>
 */
class Clickky_Widget
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
     * class Clickky_Public.
     *
     * @since      1.3.6
     * @access   private
     * @var      string $clickky_public The container of Clickky_Public class.
     */
    private $clickky_public;

    /**
     * Initialize the class and set its properties.
     *
     * @since      1.3.6
     * @param      string $clickky The name of the plugin.
     * @param      string $version The version of this plugin.
     */
    public function __construct($clickky, $version, $clickky_public, $result)
    {

        $this->plugin_name = $clickky;
        $this->version = $version;
        $this->clickky_public = $clickky_public;
        $this->result = $result;

        $this->settings = unserialize($this->result->settings);
        $this->recommend = $this->result->id;
        $this->ad = unserialize($this->result->data);

    }

    /**
     * Generate widget for Recommended Ads
     */
    public function clickky_register_widget()
    {

        wp_register_sidebar_widget(
            'clickky_widget_' . $this->result->id,
            sprintf('Clickky: ID: %s', $this->result->id),
            function () {
                echo "<div class='clickky_widget_$this->recommend'>" . $this->clickky_public->generate_recommended($this->ad) . '</div>';
            },
            array('description' => sprintf('%s ID: %s', __('Widget displays Clickky Native Apps', 'clickky'), $this->result->id))
        );

    }

    /**
     *  Info in admin widget
     */
    public function clickky_widget_control()
    {
        ?>
        <p>
            <?php printf('<strong>%s</strong> %s', __('Please note:', $this->plugin_name), sprintf('<a href="admin.php?page=clickky/settings" target="_blank">%s</a>', __("Select ad block to display in the widget you can on the plugin settings page in the 'Widget' tab.", $this->plugin_name.'-plugin'))); ?>
        </p>
    <?php }


    /**
     * Public js code in widget
     */
    public function clickky_widget_display()
    {
        echo "<div class='clickky_widget'>" . $this->clickky_public->generate_recommended($this->ad) . '</div>';
    }

}
