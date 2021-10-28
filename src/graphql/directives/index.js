const directiveResolvers = {
  isAuthenticated: (next, source, _, { user }) => {
    // For now we'll let anyone through
    console.log('This is where we would check the user for authentication before moving to next resolver!!!');
    return next;
  },
  hasPermission: (next, source, { scope }, { user }) => {
    // For now we'll let anyone through
    console.log('This is where we would check the users permissions before moving to next resolver!!!')
    return next;
  },
};

export default directiveResolvers;
