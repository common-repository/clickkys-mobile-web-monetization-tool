<?php

/**
 * @link              http://clickky.biz
 * @since             1.3.6
 * @package           Clickky
 *
 * @wordpress-plugin
 * Plugin Name:       Clickky's Mobile Web Monetization Tool
 * Plugin URI:        https://clickky.biz/content/web-mobile-monetization
 * Description:       This is a monetization plugin for Wordpress websites created for the convenience of Clickky's mobile web monetization platform customers following our mission of providing easy-to-use monetization solutions for website and application owners. Wordpress plugin is suitable for anyone who runs a website on this platform. It allows to avoid the manual integration of monetizatino code into a website and start running ads customized for Wordpress sites fast and efficiently. You need to sign up to <a target="_blank" href="https://clickky.biz/content/web-mobile-monetization" >https://clickky.biz/content/web-mobile-monetization</a> to start using the plugin correctly.
 * Version:           1.3.6
 * Author:            Сlickky
 * Author URI:        https://clickky.biz/content/web-mobile-monetization
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       clickky
 * Domain Path:       /
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'CLICKKY_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'CLICKKY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-сlickky-activator.php
 */
function activate_clickky() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-clickky-activator.php';
	Clickky_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-сlickky-deactivator.php
 */
function deactivate_clickky() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-clickky-deactivator.php';
	Clickky_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_clickky' );
register_deactivation_hook( __FILE__, 'deactivate_clickky' );



/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */

require_once plugin_dir_path( __FILE__ )  . 'includes/class-clickky.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since      1.3.6
 */
function run_clickky() {

	$plugin = new Clickky();
	$plugin->run();

}
run_clickky();

