<?php echo $this->topNavigation('global'); ?>

<div class="row content col s12">
    <h1><?php _e('Global settings', 'clickky'); ?></h1>
    <dv class="row">
        <div class="accordion">
            <form action="options.php" method="post">
                <?php settings_fields($this->plugin_name . '-settings'); ?>
                <p>
                    <input type="checkbox" id="main"
                           name="<?php echo $this->plugin_name; ?>_main"
                           class="filled-in"
                           value="1" <?php if (get_option($this->plugin_name . '_main') == 1) echo 'checked'; ?> />
                    <label for="main"><?php _e('Сheck all pages', 'clickky'); ?></label>
                </p>
                <ul class="collapsible" data-collapsible="accordion">
                    <li>
                        <div class="collapsible-header">
                            <span><?php echo _e('Select', 'clickky'); ?></span>
                            <i class="material-icons">arrow_drop_down</i>
                        </div>
                        <div class="collapsible-body">

                            <p>

                                <input type="checkbox" id="home"
                                       name="<?php echo $this->plugin_name; ?>_home"
                                       class="filled-in"
                                       value="1" <?php if (get_option($this->plugin_name . '_home') == 1 || get_option($this->plugin_name . '_main') == 1) echo 'checked'; ?> />
                                <label for="home"><?php _e('Home', 'clickky'); ?></label>

                            </p>
                        </div>
                    </li>
                    <li id="pages_all">
                        <div class="collapsible-header">
                            <span><?php echo _e('Select page', 'clickky'); ?></span>
                            <i class="material-icons">arrow_drop_down</i></div>
                        <div class="collapsible-body">
                            <?php
                            $checked_pages = unserialize(get_option($this->plugin_name . '_page'));
                            if (!is_array($checked_pages)) {
                                $checked_pages = array();
                            }
                            $pages = get_pages();
                            ?>
                            <p>
                                <input id="page_all" type="checkbox" class="filled-in"
                                       onClick="toggleCheckbox(this, 'pages_all')"
                                    <?php
                                    if (count($checked_pages) == count($pages) || get_option($this->plugin_name . '_main') == 1) {
                                        echo 'checked';
                                    }
                                    ?>
                                />
                                <label for="page_all"><?php _e('All', 'clickky'); ?></label>
                            </p>
                            <?php
                            if (count($pages) > 0) {
                                foreach ($pages as $page) {
                                    ?>
                                    <p>
                                        <input type="checkbox" class="filled-in"
                                               name="<?php echo $this->plugin_name . '_page'; ?>[]"
                                               value="<?php echo $page->ID; ?>"
                                               id="page_<?php echo $page->ID; ?>"
                                            <?php
                                            if ((is_array($checked_pages) && count($checked_pages) > 0) || get_option($this->plugin_name . '_main') == 1)
                                                if (in_array($page->ID, $checked_pages) || get_option($this->plugin_name . '_main') == 1)
                                                    echo 'checked';
                                            ?>
                                        >
                                        <label
                                            for="page_<?php echo $page->ID; ?>"><?php echo $page->post_title; ?></label>
                                    </p>
                                    <?php
                                }
                            }
                            ?>
                        </div>
                    </li>
                    <li id="all_posts">
                        <div class="collapsible-header">
                            <span><?php echo _e('Select post', 'clickky'); ?></span>
                            <i class="material-icons">arrow_drop_down</i></div>
                        <div class="collapsible-body">
                            <?php
                            $checked_posts = unserialize(get_option($this->plugin_name . '_post'));
                            if (!is_array($checked_posts)) {
                                $checked_posts = array();
                            }
                            $posts = get_posts();

                            ?>
                            <p>
                                <input id="post_all" type="checkbox" class="filled-in"
                                       onClick="toggleCheckbox(this, 'all_posts')"
                                    <?php
                                    if (count($checked_posts) == count($posts) || get_option($this->plugin_name . '_main') == 1) {
                                        echo 'checked';
                                    }
                                    ?>
                                />
                                <label for="post_all"><?php _e('All', 'clickky'); ?></label>
                            </p>
                            <?php

                            if (count($posts) > 0) {
                                foreach ($posts as $post) {
                                    ?>
                                    <p>
                                        <input type="checkbox" class="filled-in"
                                               name="<?php echo $this->plugin_name . '_post'; ?>[]"
                                               value="<?php echo $post->ID; ?>"
                                               id="post_<?php echo $post->ID; ?>"
                                            <?php
                                            if ((is_array($checked_posts) && count($checked_posts) > 0) || get_option($this->plugin_name . '_main') == 1)
                                                if (in_array($post->ID, $checked_posts) || get_option($this->plugin_name . '_main') == 1)
                                                    echo 'checked';

                                            ?>
                                        >

                                        <label
                                            for="post_<?php echo $post->ID; ?>"><?php echo $post->post_title; ?></label>
                                    </p>

                                    <?php
                                }
                            }
                            ?>

                        </div>
                    </li>
                    <li id="all_categories">
                        <div class="collapsible-header">
                            <span><?php echo _e('Select category', 'clickky'); ?></span>
                            <i class="material-icons">arrow_drop_down</i></div>
                        <div class="collapsible-body">
                            <?php
                            $checked_categories = unserialize(get_option($this->plugin_name . '_category'));
                            if (!is_array($checked_categories)) {
                                $checked_categories = array();
                            }
                            $categories = get_categories();
                            ?>
                            <p>
                                <input id="category__all" type="checkbox" class="filled-in"
                                       onClick="toggleCheckbox(this, 'all_categories')"
                                    <?php
                                    if (count($checked_categories) == count($categories) || get_option($this->plugin_name . '_main') == 1) {
                                        echo 'checked';
                                    }
                                    ?>
                                />
                                <label for="category__all"><?php _e('All', 'clickky'); ?></label>
                            </p>
                            <?php
                            if (count($categories) > 0) {
                                foreach ($categories as $category) {
                                    ?>
                                    <p>
                                        <input type="checkbox" class="filled-in"
                                               name="<?php echo $this->plugin_name . '_category'; ?>[]"
                                               value="<?php echo $category->term_id; ?>"
                                               id="category_<?php echo $category->term_id; ?>"
                                            <?php
                                            if ((is_array($checked_categories) && count($checked_categories) > 0) || get_option($this->plugin_name . '_main') == 1)
                                                if (in_array($category->term_id, $checked_categories) || get_option($this->plugin_name . '_main') == 1)
                                                    echo 'checked';
                                            ?>
                                        >
                                        <label
                                            for="category_<?php echo $category->term_id; ?>"><?php echo $category->name; ?></label>
                                    </p>
                                    <?php
                                }
                            }
                            ?>

                        </div>
                    </li>
                </ul>
                <div class="row">
                    <button type="submit" class="btn"><?php _e('Save', 'clickky'); ?></button>
                </div>
            </form>
        </div>
    </dv>
</div>

