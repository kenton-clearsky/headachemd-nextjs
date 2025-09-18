"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
  Stack,
  useTheme,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
  Schedule as ScheduleIcon,
  Publish as PublishIcon,
  Create as DraftIcon,
  Archive as ArchiveIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  where,
  Timestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { useAuth } from "@/components/providers/AuthProvider";

interface Post {
  id: string;
  authorId: string;
  authorEmail: string;
  authorName?: string; // Will be populated when we fetch user data
  caption: string;
  tag: "text" | "image" | "video" | "mix";
  media: Array<{
    type: "image" | "video";
    url: string;
    path: string;
    name: string;
    size: number;
  }>;
  status: "draft" | "published" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ContentManagement() {
  const theme = useTheme();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPostId, setMenuPostId] = useState<string | null>(null);
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [postCaption, setPostCaption] = useState("");
  const [postFiles, setPostFiles] = useState<
    Array<{
      file: File;
      previewUrl: string;
      kind: "image" | "video";
      progress: number;
    }>
  >([]);
  const [postTag, setPostTag] = useState<"text" | "image" | "video" | "mix">(
    "text"
  );
  const [isPosting, setIsPosting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  // Edit post state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editTag, setEditTag] = useState<"text" | "image" | "video" | "mix">(
    "text"
  );
  const [editFiles, setEditFiles] = useState<
    Array<{
      file: File;
      previewUrl: string;
      kind: "image" | "video";
      progress: number;
    }>
  >([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: "image" | "video";
    name: string;
  } | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [currentPostMedia, setCurrentPostMedia] = useState<
    Array<{
      type: "image" | "video";
      url: string;
      name: string;
    }>
  >([]);

  const tabs = [
    { label: "All Posts", value: "all", icon: <ArticleIcon /> },
    { label: "Published", value: "published", icon: <PublishIcon /> },
    { label: "Drafts", value: "draft", icon: <DraftIcon /> },
    { label: "Archived", value: "archived", icon: <ArchiveIcon /> },
  ];

  useEffect(() => {
    fetchPosts();
  }, [currentTab]);

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const computeSuggestedTag = (
    files: typeof postFiles
  ): "text" | "image" | "video" | "mix" => {
    if (files.length === 0) return "text";
    const hasImage = files.some((f) => f.kind === "image");
    const hasVideo = files.some((f) => f.kind === "video");
    if (hasImage && hasVideo) return "mix";
    if (hasVideo) return "video";
    if (hasImage) return "image";
    return "text";
  };

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map((file) => {
      const isVideo = file.type.startsWith("video/");
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        kind: (isVideo ? "video" : "image") as "image" | "video",
        progress: 0,
      };
    });
    setPostFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setPostFiles((prev) => {
      const file = prev[index];
      URL.revokeObjectURL(file.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleMediaClick = (
    media: {
      url: string;
      type: "image" | "video";
      name: string;
    },
    allMedia?: Array<{
      type: "image" | "video";
      url: string;
      name: string;
    }>,
    startIndex?: number
  ) => {
    setSelectedMedia(media);
    setCurrentPostMedia(allMedia || [media]);
    setSelectedMediaIndex(startIndex || 0);
    setMediaModalOpen(true);
  };

  const handleNextMedia = () => {
    if (selectedMediaIndex < currentPostMedia.length - 1) {
      const newIndex = selectedMediaIndex + 1;
      setSelectedMediaIndex(newIndex);
      setSelectedMedia(currentPostMedia[newIndex]);
    }
  };

  const handlePrevMedia = () => {
    if (selectedMediaIndex > 0) {
      const newIndex = selectedMediaIndex - 1;
      setSelectedMediaIndex(newIndex);
      setSelectedMedia(currentPostMedia[newIndex]);
    }
  };

  const handleCloseMediaModal = () => {
    setMediaModalOpen(false);
    setSelectedMedia(null);
  };

  const fetchUserName = async (userId: string): Promise<string> => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const firstName = userData.profile?.firstName || "";
        const lastName = userData.profile?.lastName || "";
        if (firstName || lastName) {
          return `${firstName} ${lastName}`.trim();
        }
      }
      return "Unknown User";
    } catch (error) {
      console.error("Error fetching user name:", error);
      return "Unknown User";
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

      // Filter by status based on current tab
      if (currentTab !== 0) {
        const status = tabs[currentTab].value;
        q = query(
          collection(db, "posts"),
          where("status", "==", status),
          orderBy("createdAt", "desc")
        );
      }

      const querySnapshot = await getDocs(q);
      const postsData: Post[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        postsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          // For older posts without authorName, fetch it as fallback
          authorName: data.authorName || undefined,
        } as Post);
      });

      // For any posts without authorName (legacy posts), fetch the names
      const postsWithNames = await Promise.all(
        postsData.map(async (post) => {
          if (!post.authorName) {
            const authorName = await fetchUserName(post.authorId);
            return {
              ...post,
              authorName,
            };
          }
          return post;
        })
      );

      setPosts(postsWithNames);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    postId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuPostId(null);
  };

  const handleViewPost = (post: Post) => {
    setSelectedPost(post);
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setEditCaption(post.caption || "");
    setEditTag(post.tag || "text");
    setEditFiles([]); // Start with no new files, user can add if needed
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeletePost = (post: Post) => {
    setSelectedPost(post);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleEditSelectFiles = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    const fileData = files.map((file) => {
      const isVideo = file.type.startsWith("video/");
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        kind: isVideo ? ("video" as const) : ("image" as const),
        progress: 0,
      };
    });
    setEditFiles((prev) => [...prev, ...fileData]);
    setEditTag(computeSuggestedTag([...editFiles, ...fileData]));
  };

  const handleEditRemoveFile = (idx: number) => {
    const copy = [...editFiles];
    const removed = copy.splice(idx, 1)[0];
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    setEditFiles(copy);
    setEditTag(computeSuggestedTag(copy));
  };

  const handleUpdatePost = async () => {
    if (!editingPost || !user) {
      showSnackbar("Unable to update post", "error");
      return;
    }

    setIsUpdating(true);

    try {
      const postRef = doc(db, "posts", editingPost.id);
      let uploadedMedia = [...(editingPost.media || [])]; // Keep existing media

      // Upload new files if any
      if (editFiles.length > 0) {
        const newMedia = await Promise.all(
          editFiles.map(async (fileData) => {
            const fileName = `${Date.now()}_${fileData.file.name}`;
            const storageRef = ref(
              storage,
              `posts/${editingPost.id}/${fileName}`
            );

            const uploadTask = uploadBytesResumable(storageRef, fileData.file);

            return new Promise<{
              url: string;
              type: "image" | "video";
              name: string;
              path: string;
              size: number;
            }>((resolve, reject) => {
              uploadTask.on(
                "state_changed",
                (snapshot) => {
                  const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  setEditFiles((prev) =>
                    prev.map((f) =>
                      f.file === fileData.file ? { ...f, progress } : f
                    )
                  );
                },
                (error) => reject(error),
                async () => {
                  const downloadURL = await getDownloadURL(
                    uploadTask.snapshot.ref
                  );
                  resolve({
                    url: downloadURL,
                    type: fileData.kind,
                    name: fileName,
                    path: `posts/${editingPost.id}/${fileName}`,
                    size: fileData.file.size,
                  });
                }
              );
            });
          })
        );

        uploadedMedia = [...uploadedMedia, ...newMedia];
      }

      const finalTag = editTag || computeSuggestedTag(editFiles);

      // Get author name from user profile if not already set
      let authorName = editingPost.authorName;
      if (!authorName) {
        authorName = await fetchUserName(user.id);
      }

      const updateData = {
        caption: editCaption || "",
        tag: finalTag,
        media: uploadedMedia,
        authorName: authorName,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(postRef, updateData);

      // Update local state
      setPosts((prev) =>
        prev.map((post) =>
          post.id === editingPost.id
            ? {
                ...post,
                ...updateData,
                updatedAt: updateData.updatedAt.toDate(),
              }
            : post
        )
      );

      // Clean up
      editFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setEditFiles([]);
      setEditCaption("");
      setEditTag("text");
      setEditingPost(null);
      setEditDialogOpen(false);

      showSnackbar("Post updated successfully!", "success");
    } catch (error) {
      console.error("Error updating post:", error);
      showSnackbar("Failed to update post", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (
    postId: string,
    newStatus: "draft" | "published" | "archived"
  ) => {
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        status: newStatus,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Update local state
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? { ...post, status: newStatus, updatedAt: new Date() }
            : post
        )
      );
    } catch (error) {
      console.error("Error updating post status:", error);
    }
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;

    try {
      await deleteDoc(doc(db, "posts", selectedPost.id));
      setPosts(posts.filter((post) => post.id !== selectedPost.id));
      setDeleteDialogOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleCreatePost = async () => {
    try {
      if (!user) {
        showSnackbar("You must be signed in", "error");
        return;
      }
      if (!postCaption && postFiles.length === 0) {
        showSnackbar("Add a caption or at least one media file", "warning");
        return;
      }
      setIsPosting(true);

      const postRef = doc(collection(db, "posts"));
      const postId = postRef.id;

      const uploadedMedia: Array<{
        type: "image" | "video";
        url: string;
        path: string;
        name: string;
        size: number;
      }> = [];

      for (let i = 0; i < postFiles.length; i++) {
        const item = postFiles[i];
        const storagePath = `posts/${postId}/${Date.now()}_${encodeURIComponent(
          item.file.name
        )}`;
        const sRef = ref(storage, storagePath);
        await new Promise<void>((resolve, reject) => {
          const metadata = {
            contentType: item.file.type,
            customMetadata: {
              uploadedBy: user.id,
              uploadedAt: new Date().toISOString(),
            },
          };
          const task = uploadBytesResumable(sRef, item.file, metadata);
          task.on(
            "state_changed",
            (snap) => {
              const pct = Math.round(
                (snap.bytesTransferred / snap.totalBytes) * 100
              );
              setPostFiles((curr) =>
                curr.map((pf, idx) =>
                  idx === i ? { ...pf, progress: pct } : pf
                )
              );
            },
            (err) => reject(err),
            async () => {
              const url = await getDownloadURL(task.snapshot.ref);
              uploadedMedia.push({
                type: item.kind,
                url,
                path: storagePath,
                name: item.file.name,
                size: item.file.size,
              });
              resolve();
            }
          );
        });
      }

      const finalTag = postTag || computeSuggestedTag(postFiles);

      // Get author name from user profile
      const authorName = await fetchUserName(user.id);

      const postDoc = {
        authorId: user.id,
        authorEmail: user.email,
        authorName: authorName,
        caption: postCaption || "",
        tag: finalTag,
        media: uploadedMedia,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        status: "draft",
      };
      await setDoc(postRef, postDoc);

      // Clean up
      postFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setPostFiles([]);
      setPostCaption("");
      setPostTag("text");
      setNewPostDialogOpen(false);

      // Refresh posts list
      fetchPosts();

      showSnackbar("Post saved as draft successfully!", "success");
    } catch (error) {
      showSnackbar(
        (error as Error).message || "Failed to create post",
        "error"
      );
    } finally {
      setIsPosting(false);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.authorName &&
        post.authorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "default";
      default:
        return "default";
    }
  };

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case "image":
        return <ImageIcon />;
      case "video":
        return <VideoIcon />;
      case "mix":
        return <ImageIcon />;
      default:
        return <ArticleIcon />;
    }
  };

  const formatDate = (date: Date) => {
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <Box>
      <Card>
        <CardHeader
          title="Content Management"
          subheader="Manage your posts, drafts, and published content"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewPostDialogOpen(true)}
            >
              New Post
            </Button>
          }
        />

        <CardContent>
          {/* Search and Filter */}
          <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              placeholder="Search by content, author name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => setCurrentTab(newValue)}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.value}
                  icon={tab.icon}
                  label={tab.label}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>

          {/* Content */}
          {loading ? (
            <LinearProgress />
          ) : (
            <Grid container spacing={3}>
              {filteredPosts.map((post) => (
                <Grid item xs={12} sm={6} md={4} key={post.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        boxShadow: theme.shadows[8],
                        transform: "translateY(-2px)",
                        transition: "all 0.2s ease-in-out",
                      },
                    }}
                  >
                    {/* Media Header */}
                    {post.media.length > 0 && (
                      <Box
                        sx={{
                          position: "relative",
                          height: 200,
                          overflow: "hidden",
                          cursor: "pointer",
                          "&:hover .media-overlay": { opacity: 1 },
                        }}
                        onClick={() =>
                          handleMediaClick(
                            {
                              url: post.media[0].url,
                              type: post.media[0].type,
                              name: post.media[0].name,
                            },
                            post.media,
                            0
                          )
                        }
                      >
                        {post.media[0].type === "image" ? (
                          <img
                            src={post.media[0].url}
                            alt={post.media[0].name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <video
                            src={post.media[0].url}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}

                        {/* Media overlay */}
                        <Box
                          className="media-overlay"
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: "rgba(0,0,0,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            transition: "opacity 0.2s ease-in-out",
                          }}
                        >
                          {post.media[0].type === "video" ? (
                            <PlayArrowIcon
                              sx={{ color: "white", fontSize: 40 }}
                            />
                          ) : (
                            <FullscreenIcon
                              sx={{ color: "white", fontSize: 32 }}
                            />
                          )}
                        </Box>

                        {/* Media count badge */}
                        {post.media.length > 1 && (
                          <Chip
                            label={`+${post.media.length - 1}`}
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              bgcolor: "rgba(0,0,0,0.7)",
                              color: "white",
                            }}
                          />
                        )}
                      </Box>
                    )}

                    {/* Text-only post header */}
                    {post.media.length === 0 && (
                      <Box
                        sx={{
                          height: 120,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "grey.50",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <ArticleIcon
                          sx={{ fontSize: 48, color: "text.secondary" }}
                        />
                      </Box>
                    )}

                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      {/* Header with status and actions */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", gap: 1, alignItems: "center" }}
                        >
                          <Chip
                            label={post.status}
                            color={getStatusColor(post.status) as any}
                            size="small"
                          />
                          <Chip
                            icon={getTagIcon(post.tag)}
                            label={post.tag}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, post.id)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      {/* Post content */}
                      <Typography
                        variant="body1"
                        sx={{
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "4.5em",
                        }}
                      >
                        {post.caption || "No caption"}
                      </Typography>

                      {/* Author and date info */}
                      <Box sx={{ mt: "auto" }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          By {post.authorName || post.authorEmail}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {formatDate(post.createdAt)}
                        </Typography>
                        {post.updatedAt.getTime() !==
                          post.createdAt.getTime() && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Updated: {formatDate(post.updatedAt)}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {filteredPosts.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <ArticleIcon
                      sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No posts found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "Create your first post to get started"}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const post = posts.find((p) => p.id === menuPostId);
            if (post) handleViewPost(post);
          }}
        >
          <VisibilityIcon sx={{ mr: 1 }} />
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            const post = posts.find((p) => p.id === menuPostId);
            if (post) handleEditPost(post);
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuPostId) handleStatusChange(menuPostId, "published");
          }}
        >
          <PublishIcon sx={{ mr: 1 }} />
          Publish
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuPostId) handleStatusChange(menuPostId, "draft");
          }}
        >
          <DraftIcon sx={{ mr: 1 }} />
          Move to Draft
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuPostId) handleStatusChange(menuPostId, "archived");
          }}
        >
          <ArchiveIcon sx={{ mr: 1 }} />
          Archive
        </MenuItem>
        <MenuItem
          onClick={() => {
            const post = posts.find((p) => p.id === menuPostId);
            if (post) handleDeletePost(post);
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* View Post Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          View Post
          <Chip
            label={selectedPost?.status}
            color={getStatusColor(selectedPost?.status || "") as any}
            size="small"
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          {selectedPost && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedPost.caption || "No caption"}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                By {selectedPost.authorName || selectedPost.authorEmail} •{" "}
                {formatDate(selectedPost.createdAt)}
              </Typography>

              {selectedPost.media.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Media ({selectedPost.media.length} files)
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedPost.media.map((media, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box
                          sx={{
                            cursor: "pointer",
                            "&:hover": { opacity: 0.8 },
                          }}
                          onClick={() =>
                            handleMediaClick(
                              {
                                url: media.url,
                                type: media.type,
                                name: media.name,
                              },
                              selectedPost?.media,
                              index
                            )
                          }
                        >
                          {media.type === "image" ? (
                            <img
                              src={media.url}
                              alt={media.name}
                              style={{
                                width: "100%",
                                height: "200px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          ) : (
                            <Box sx={{ position: "relative" }}>
                              <video
                                src={media.url}
                                style={{
                                  width: "100%",
                                  height: "200px",
                                  borderRadius: "8px",
                                  objectFit: "cover",
                                }}
                              />
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  bgcolor: "rgba(0,0,0,0.6)",
                                  borderRadius: "50%",
                                  p: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <VideoIcon
                                  sx={{ color: "white", fontSize: 32 }}
                                />
                              </Box>
                            </Box>
                          )}
                        </Box>
                        <Typography variant="caption" display="block">
                          {media.name}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Post Dialog */}
      <Dialog
        open={newPostDialogOpen}
        onClose={() => setNewPostDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Post</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Caption (optional)"
              value={postCaption}
              onChange={(e) => setPostCaption(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />

            <FormControl>
              <InputLabel>Post Type</InputLabel>
              <Select
                value={postTag}
                label="Post Type"
                onChange={(e) => setPostTag(e.target.value as any)}
              >
                <SelectMenuItem value="text">Text</SelectMenuItem>
                <SelectMenuItem value="image">Image</SelectMenuItem>
                <SelectMenuItem value="video">Video</SelectMenuItem>
                <SelectMenuItem value="mix">Mixed Media</SelectMenuItem>
              </Select>
            </FormControl>

            <Box>
              <Button variant="outlined" component="label">
                Select Images/Videos
                <input
                  hidden
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleSelectFiles}
                />
              </Button>
              {postFiles.length > 0 && (
                <Typography variant="caption" sx={{ ml: 2 }}>
                  {postFiles.length} file(s) selected
                </Typography>
              )}
            </Box>

            {postFiles.length > 0 && (
              <Grid container spacing={2}>
                {postFiles.map((pf, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Box
                      sx={{
                        position: "relative",
                        border: 1,
                        borderColor: "grey.300",
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      {pf.kind === "image" ? (
                        <img
                          src={pf.previewUrl}
                          alt="Preview"
                          style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <video
                          src={pf.previewUrl}
                          style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(0,0,0,0.5)",
                          color: "white",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                        }}
                        onClick={() => handleRemoveFile(idx)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      {pf.progress > 0 && pf.progress < 100 && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                          }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={pf.progress}
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewPostDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePost}
            variant="contained"
            disabled={isPosting}
            startIcon={isPosting ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {isPosting ? "Creating..." : "Create Post"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Caption (optional)"
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />

            <FormControl>
              <InputLabel>Post Type</InputLabel>
              <Select
                value={editTag}
                label="Post Type"
                onChange={(e) => setEditTag(e.target.value as any)}
              >
                <SelectMenuItem value="text">Text</SelectMenuItem>
                <SelectMenuItem value="image">Image</SelectMenuItem>
                <SelectMenuItem value="video">Video</SelectMenuItem>
                <SelectMenuItem value="mix">Mixed Media</SelectMenuItem>
              </Select>
            </FormControl>

            {/* Existing Media */}
            {editingPost?.media && editingPost.media.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Current Media ({editingPost.media.length} files)
                </Typography>
                <Grid container spacing={1}>
                  {editingPost.media.map((media, idx) => (
                    <Grid item xs={6} sm={4} md={3} key={idx}>
                      <Box
                        sx={{
                          position: "relative",
                          border: 1,
                          borderColor: "grey.300",
                          borderRadius: 1,
                          overflow: "hidden",
                        }}
                      >
                        {media.type === "image" ? (
                          <img
                            src={media.url}
                            alt="Current media"
                            style={{
                              width: "100%",
                              height: "80px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <video
                            src={media.url}
                            style={{
                              width: "100%",
                              height: "80px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            <Box>
              <Button variant="outlined" component="label">
                Add New Images/Videos
                <input
                  hidden
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleEditSelectFiles}
                />
              </Button>
              {editFiles.length > 0 && (
                <Typography variant="caption" sx={{ ml: 2 }}>
                  {editFiles.length} new file(s) selected
                </Typography>
              )}
            </Box>

            {editFiles.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  New Media to Add
                </Typography>
                <Grid container spacing={2}>
                  {editFiles.map((pf, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Box
                        sx={{
                          position: "relative",
                          border: 1,
                          borderColor: "grey.300",
                          borderRadius: 1,
                          overflow: "hidden",
                        }}
                      >
                        {pf.kind === "image" ? (
                          <img
                            src={pf.previewUrl}
                            alt="Preview"
                            style={{
                              width: "100%",
                              height: "150px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <video
                            src={pf.previewUrl}
                            style={{
                              width: "100%",
                              height: "150px",
                              objectFit: "cover",
                            }}
                          />
                        )}

                        <IconButton
                          onClick={() => handleEditRemoveFile(idx)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(255,255,255,0.8)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                            width: 32,
                            height: 32,
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>

                        {pf.progress > 0 && pf.progress < 100 && (
                          <LinearProgress
                            variant="determinate"
                            value={pf.progress}
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                            }}
                          />
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialogOpen(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePost}
            variant="contained"
            disabled={isUpdating}
            startIcon={
              isUpdating ? <CircularProgress size={20} /> : <EditIcon />
            }
            sx={{
              background: "linear-gradient(135deg, #a5c422 0%, #8fb01a 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #8fb01a 0%, #7a9a15 100%)",
              },
            }}
          >
            {isUpdating ? "Updating..." : "Update Post"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Modal */}
      <Dialog
        open={mediaModalOpen}
        onClose={handleCloseMediaModal}
        maxWidth={false}
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "black",
            maxWidth: "90vw",
            maxHeight: "90vh",
            margin: "auto",
          },
        }}
      >
        {/* Header with close button and counter */}
        <DialogActions
          sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
        >
          {currentPostMedia.length > 1 && (
            <Typography
              variant="body2"
              sx={{
                color: "white",
                bgcolor: "rgba(0,0,0,0.5)",
                px: 2,
                py: 0.5,
                borderRadius: 1,
                mr: 1,
              }}
            >
              {selectedMediaIndex + 1} / {currentPostMedia.length}
            </Typography>
          )}
          <IconButton
            onClick={handleCloseMediaModal}
            sx={{
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogActions>

        {/* Navigation arrows */}
        {currentPostMedia.length > 1 && (
          <>
            <IconButton
              onClick={handlePrevMedia}
              disabled={selectedMediaIndex === 0}
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
                color: "white",
                bgcolor: "rgba(0,0,0,0.5)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                "&:disabled": { opacity: 0.3 },
              }}
            >
              <ChevronLeftIcon fontSize="large" />
            </IconButton>

            <IconButton
              onClick={handleNextMedia}
              disabled={selectedMediaIndex === currentPostMedia.length - 1}
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
                color: "white",
                bgcolor: "rgba(0,0,0,0.5)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                "&:disabled": { opacity: 0.3 },
              }}
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>
          </>
        )}

        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "black",
            minHeight: "50vh",
          }}
        >
          {selectedMedia && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {selectedMedia.type === "image" ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "80vh",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  style={{
                    maxWidth: "100%",
                    maxHeight: "80vh",
                    objectFit: "contain",
                  }}
                />
              )}

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "white",
                    opacity: 0.8,
                  }}
                >
                  {selectedMedia.name}
                </Typography>

                {/* Thumbnail navigation for multiple media */}
                {currentPostMedia.length > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mt: 2,
                      justifyContent: "center",
                      flexWrap: "wrap",
                      maxWidth: "80vw",
                      overflow: "auto",
                    }}
                  >
                    {currentPostMedia.map((media, index) => (
                      <Box
                        key={index}
                        onClick={() => {
                          setSelectedMediaIndex(index);
                          setSelectedMedia(media);
                        }}
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1,
                          overflow: "hidden",
                          cursor: "pointer",
                          border:
                            selectedMediaIndex === index
                              ? "2px solid white"
                              : "2px solid transparent",
                          opacity: selectedMediaIndex === index ? 1 : 0.6,
                          "&:hover": { opacity: 1 },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        {media.type === "image" ? (
                          <img
                            src={media.url}
                            alt={media.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              bgcolor: "grey.800",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <PlayArrowIcon
                              sx={{ color: "white", fontSize: 20 }}
                            />
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
