<?php

/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       https://clickky.biz/
 * @since      1.3.6
 *
 * @package    Clickky
 * @subpackage Clickky/includes
 */

class Clickky_i18n {


	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since      1.3.6
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain(
			'clickky',
			false,
			dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
		);

	}



}
