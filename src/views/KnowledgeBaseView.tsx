/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Divider,
    CardHeader,
    Chip
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import FolderIcon from '@mui/icons-material/Folder';
import ArticleIcon from '@mui/icons-material/Article';
import { KnowledgeBaseArticle } from '../types';
import { useClinicStore } from '../store';

// A simple function to render text with newlines as paragraphs
const renderContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
        <Typography key={index} paragraph sx={{ whiteSpace: 'pre-wrap' }}>
            {paragraph || <br />}
        </Typography>
    ));
};

export const KnowledgeBaseView: React.FC = () => {
    const articles = useClinicStore(state => state.knowledgeBase);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
    const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);

    const categories: string[] = ['כל המאמרים', ...new Set(articles.map((a: KnowledgeBaseArticle) => a.category))];

    const filteredArticles = articles.filter(article => 
        selectedCategoryId === 'all' || article.category === selectedCategoryId
    );

    const handleSelectCategory = (category: string) => {
        setSelectedCategoryId(category);
        setSelectedArticle(null); // Deselect article when changing category
    };
    
    const handleSelectArticle = (article: KnowledgeBaseArticle) => {
        setSelectedArticle(article);
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: '700' }}>
                מאגר ידע ונהלים
            </Typography>

            <Grid container spacing={3}>
                {/* Categories Sidebar */}
                <Grid xs={12} md={3}>
                    <Card>
                        <CardHeader title="קטגוריות" />
                        <Divider />
                        <List component="nav" sx={{ p: 1 }}>
                            {categories.map((category) => (
                                <ListItemButton
                                    key={category}
                                    selected={selectedCategoryId === category}
                                    onClick={() => handleSelectCategory(category)}
                                    sx={{ borderRadius: 'var(--card-radius)' }}
                                >
                                    <ListItemIcon>
                                        <FolderIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={category} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Card>
                </Grid>

                {/* Content Area */}
                <Grid xs={12} md={9}>
                    <Card sx={{ minHeight: 'calc(100vh - 240px)' }}>
                        <CardContent sx={{ p: 3 }}>
                            {selectedArticle ? (
                                // Display selected article
                                <>
                                    <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
                                        {selectedArticle.title}
                                    </Typography>
                                    <Chip label={selectedArticle.category} color="primary" variant="outlined" size="small" sx={{ mb: 2 }} />
                                    <Divider sx={{ mb: 2 }} />
                                    <Box>
                                        {renderContent(selectedArticle.content)}
                                    </Box>
                                </>
                            ) : (
                                // Display list of articles in the selected category
                                <>
                                    <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
                                        {selectedCategoryId === 'all' ? 'כל המאמרים' : `מאמרים בקטגוריית "${selectedCategoryId}"`}
                                    </Typography>
                                    <Divider sx={{ mb: 2 }}/>
                                    <List>
                                        {filteredArticles.map(article => (
                                            <ListItemButton key={article.id} onClick={() => handleSelectArticle(article)}>
                                                <ListItemIcon>
                                                    <ArticleIcon />
                                                </ListItemIcon>
                                                <ListItemText primary={article.title} secondary={article.category} />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};