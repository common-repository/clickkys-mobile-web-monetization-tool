<?php

/**
 * Fired when the plugin is uninstalled.
 *
 * When populating this file, consider the following flow
 * of control:
 *
 * - This method should be static
 * - Check if the $_REQUEST content actually is the plugin name
 * - Run an admin referrer check to make sure it goes through authentication
 * - Verify the output of $_GET makes sense
 * - Repeat with other user roles. Best directly by using the links/query string parameters.
 * - Repeat things for multisite. Once for a single site in the network, once sitewide.
 *
 * This file may be updated more in future version of the Boilerplate; however, this is the
 * general skeleton and outline for how the file should work.
 *
 *
 * @link       https://clickky.biz/
 * @since      1.3.6
 *
 * @package    Clickky
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

global $wpdb;
delete_option("clickky_password");
delete_option("clickky_login");
delete_option("clickky_main");
delete_option("clickky_home");
delete_option("clickky_page");
delete_option("clickky_post");
delete_option("clickky_category");
delete_option("clickky_db_version");
$table_name = $wpdb->prefix . "clickky_ads";
$sql = "DROP TABLE " . $table_name;
$wpdb->query($sql);
require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
